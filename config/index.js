import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode, encode } from "base-64";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import moment from "moment";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Alert, Platform } from "react-native";
const APP_NAME = Constants.expoConfig?.name;

// Polyfill first
if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

// now it's safe to import jsPDF
import { jsPDF } from "jspdf";

// ✅ wrap baseUri usage in a validator
const getBaseUri = async () => {
  let baseUri = await AsyncStorage.getItem("baseUri");

  if (baseUri) {
    // Check if still valid
    try {
      await FileSystem.StorageAccessFramework.readDirectoryAsync(baseUri);
      return baseUri; // still there
    } catch (e) {
      console.warn("Stored baseUri invalid, asking again…");
      await AsyncStorage.removeItem("baseUri");
      baseUri = null;
    }
  }

  // Ask user for DCIM folder once
  const defaultDirectoryUri =
    await FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("DCIM");

  const perms =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
      defaultDirectoryUri
    );
  if (!perms.granted) throw new Error("Permission denied");

  // Create or get /Grader under DCIM
  const graderUri = await ensureSubfolder(perms.directoryUri, APP_NAME);

  await AsyncStorage.setItem("baseUri", graderUri);
  return graderUri;
};

const ensureSubfolder = async (parentUri, folderName) => {
  const children = await FileSystem.StorageAccessFramework.readDirectoryAsync(
    parentUri
  );

  const match = children.find((uri) => {
    const name = decodeURIComponent(uri.split("%2F").pop());
    return name === folderName;
  });

  if (match) return match;

  return await FileSystem.StorageAccessFramework.makeDirectoryAsync(
    parentUri,
    folderName
  );
};

const getGraderFolderUri = async (folders = []) => {
  let currentUri = await getBaseUri(); // now validated

  for (const folder of folders) {
    currentUri = await ensureSubfolder(currentUri, folder);
  }
  return currentUri;
};

const formatCNIC = (str = "") => {
  let cnic = str.toString().replace(/\D/g, "");

  if (cnic.length <= 5) {
    return cnic;
  } else if (cnic.length <= 12) {
    return `${cnic.slice(0, 5)}-${cnic.slice(5)}`;
  } else {
    return `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12, 13)}`;
  }
};

const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatNumber = (num) => {
  if (num === null || num === undefined || num === "") return;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

async function createDummyPDF() {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow storage access.");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([600, 400]);
    page.drawText("Hello from pdf-lib!", {
      x: 50,
      y: 350,
      size: 24,
      font,
      color: rgb(0, 0.53, 0.71),
    });

    // 👇 directly get base64 from pdf-lib
    const base64 = await pdfDoc.saveAsBase64();
    const fileUri = `${FileSystem.cacheDirectory}dummy_${Date.now()}.pdf`;

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await MediaLibrary.saveToLibraryAsync(fileUri);
    Alert.alert("✅ PDF Created", "Dummy PDF saved to gallery.");
    return fileUri;
  } catch (err) {
    console.error("Dummy PDF Error:", err);
    Alert.alert("❌ Error", "Could not create dummy PDF");
  }
}

const getImageBase64 = async (url) => {
  // download to a temp file
  const fileUri = FileSystem.cacheDirectory + `logo_${Date.now()}.png`;
  const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
  const { uri } = await downloadResumable.downloadAsync();

  // read as base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64; // only the base64 data, no data:image/png prefix
};

const generateChallan = async (fee, bank, campusStr) => {
  try {
    // Helper to ensure jsPDF gets a string
    const safeText = (val) =>
      val !== undefined && val !== null ? String(val) : "";

    // Objects
    const student = fee.student;
    const studentClass = fee.class;

    // Vars
    const dueDate = fee.dueDate;
    const formattedDueDate = moment(dueDate).format("DD-MMM-YYYY");
    const month = fee.month;
    const formattedMonth = moment(month).format("MMM, YYYY");
    const formattedFeeLabel = `Fee (${moment(month).format("MMM-YYYY")})`;
    const feeAmount = formatNumber(fee.amount);
    const lmsFee = formatNumber(fee.lmsFee);
    const outstandingFee = fee.previousBalance
      ? formatNumber(fee.previousBalance)
      : 0;
    let extraAmountToAdd = 0;
    if (fee.extraFeeAmount) extraAmountToAdd = fee.extraFeeAmount;
    const totalAmount = formatNumber(
      fee.amount + fee.previousBalance + fee.lmsFee + extraAmountToAdd
    );
    const lateFee = formatNumber(fee.lateFee);
    const lateFeeTotalAmount = formatNumber(
      fee.amount +
        fee.previousBalance +
        fee.lmsFee +
        fee.lateFee +
        extraAmountToAdd
    );
    const issueDate = moment(fee.createdAt).format("DD-MMM-YYYY");
    const extraFeeName = fee.extraFeeName;
    const extraFeeAmount = formatNumber(fee.extraFeeAmount);

    // School & Campus
    const campus = JSON.parse(campusStr); // Stored in Storage but named school
    const campusName = campus.name;
    const school = campus.school;
    const schoolName = school.name;
    const schoolLogo = school.logoUrl;
    const schoolPhoneNumber = campus?.phoneNumber;
    const logoBase64 = await getImageBase64(schoolLogo);

    // Bank
    const bankName = `${bank.name} Bank`;
    const bankTitle = bank.title;
    const bankAccount = bank.account;

    // Student
    const studentName = student.name;
    const fatherName = student.fatherName;
    const formattedClass = ` ${studentClass.name}-${studentClass.section} (${studentClass.timeDuration.name})`;

    // PDF Generation
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 5;
    const usableWidth = pageWidth - margin * 2;
    const sectionWidth = usableWidth / 3;
    const sectionHeight = pageHeight - margin * 2;

    const drawChallan = (xOffset, title) => {
      let currentY = margin + 5;

      // Outer border
      doc.rect(xOffset, margin, sectionWidth, sectionHeight);

      // Logo
      doc.addImage(
        logoBase64,
        "PNG",
        xOffset + sectionWidth / 2 - 8,
        12,
        16,
        16
      );

      currentY = 35;

      // School Name & Address
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.text(safeText(schoolName), xOffset + sectionWidth / 2, currentY, {
        align: "center",
      });
      currentY += 6;

      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.text(safeText(campusName), xOffset + sectionWidth / 2, currentY, {
        align: "center",
      });
      if (schoolPhoneNumber) {
        currentY += 5;
        doc.text(
          "Phone: " + safeText(schoolPhoneNumber),
          xOffset + sectionWidth / 2,
          currentY,
          { align: "center" }
        );
      }
      currentY += 7;

      // Account Number Boxes
      const accountNumber = bankAccount;
      const boxSize = 5;
      const totalWidth = accountNumber.length * boxSize;
      const startX = xOffset + sectionWidth / 2 - totalWidth / 2;

      for (let i = 0; i < accountNumber.length; i++) {
        const x = startX + i * boxSize;
        doc.rect(x, currentY, boxSize, 6);
        doc.text(safeText(accountNumber[i]), x + boxSize / 2, currentY + 4, {
          align: "center",
        });
      }

      currentY += 10;

      // Bank Name
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, 6);
      doc.line(
        xOffset + sectionWidth / 2,
        currentY,
        xOffset + sectionWidth / 2,
        currentY + 6
      );
      doc.text("Bank Name", xOffset + 4, currentY + 4);
      doc.text(
        safeText(bankName),
        xOffset + sectionWidth / 2 + 4,
        currentY + 4
      );

      currentY += 8;

      // Title
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, 6);
      doc.line(
        xOffset + sectionWidth / 2,
        currentY,
        xOffset + sectionWidth / 2,
        currentY + 6
      );
      doc.text("Title", xOffset + 4, currentY + 4);
      doc.text(
        safeText(bankTitle),
        xOffset + sectionWidth / 2 + 4,
        currentY + 4
      );

      // Copy Title
      currentY += 8;
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, 6);
      doc.text(safeText(title), xOffset + sectionWidth / 2, currentY + 4, {
        align: "center",
      });
      currentY += 10;

      // Student Info
      const info = [
        ["Comp No:", "Month:", "1234", formattedMonth],
        ["Student's Name:", studentName],
        ["Father's Name:", fatherName],
        ["Class/Section:", formattedClass],
        ["Issue Date:", "Due Date:", issueDate, formattedDueDate],
        ["Slip No#:", "2509357445"],
      ];

      const studentBoxHeight = 32;
      const rowHeight = studentBoxHeight / info.length;
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, studentBoxHeight);

      for (let i = 1; i < info.length; i++) {
        const y = currentY + i * rowHeight;
        doc.line(xOffset + 2, y, xOffset + sectionWidth - 2, y);
      }

      const dividerX = xOffset + sectionWidth / 2;
      doc.line(dividerX, currentY, dividerX, currentY + studentBoxHeight);

      doc.setFont("times", "normal");
      doc.setFontSize(8);
      let infoY = currentY + rowHeight / 2 + 1;
      const labelWidth = 20;

      info.forEach((row, i) => {
        const rowTop = currentY + i * rowHeight;
        const rowBottom = rowTop + rowHeight;

        if (row.length === 4) {
          const leftLabelX = xOffset + 4;
          const leftDividerX = xOffset + 2 + labelWidth;

          doc.text(safeText(row[0]), leftLabelX, infoY);
          doc.line(leftDividerX, rowTop, leftDividerX, rowBottom);
          doc.text(safeText(row[2]), leftDividerX + 2, infoY);

          const rightLabelX = dividerX + 4;
          const rightDividerX = dividerX + labelWidth;

          doc.text(safeText(row[1]), rightLabelX, infoY);
          doc.line(rightDividerX, rowTop, rightDividerX, rowBottom);
          doc.text(safeText(row[3]), rightDividerX + 2, infoY);
        } else {
          doc.text(safeText(row[0]), xOffset + 4, infoY);
          doc.text(safeText(row[1]), dividerX + 4, infoY);
        }

        infoY += rowHeight;
      });

      currentY += studentBoxHeight + 5;

      // Fee Table
      const feeBoxHeight = 36; // increased to fit extra row
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, feeBoxHeight);
      const feeDividerX = xOffset + sectionWidth - 30;
      doc.line(feeDividerX, currentY, feeDividerX, currentY + feeBoxHeight);

      let feeY = currentY + 4;
      doc.setFont("times", "bold");
      doc.text("Particulars", xOffset + 4, feeY);
      doc.text("Amount", feeDividerX + 2, feeY);
      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

      feeY += 5;
      doc.setFont("times", "normal");
      doc.text(safeText(formattedFeeLabel), xOffset + 4, feeY);
      doc.text(safeText(feeAmount), feeDividerX + 2, feeY);
      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

      feeY += 5;
      doc.text("LMS fees", xOffset + 4, feeY);
      doc.text(safeText(lmsFee), feeDividerX + 2, feeY);
      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

      if (outstandingFee) {
        feeY += 5;
        doc.text("Outstanding", xOffset + 4, feeY);
        doc.text(safeText(outstandingFee), feeDividerX + 2, feeY);
        doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);
      }

      if (extraFeeName && extraFeeAmount) {
        feeY += 5;
        doc.text(safeText(extraFeeName), xOffset + 4, feeY);
        doc.text(safeText(extraFeeAmount), feeDividerX + 2, feeY);
        doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);
      }

      // blank lines
      if (!outstandingFee) {
        feeY += 5;
        doc.text("", xOffset + 4, feeY);
        doc.text("", feeDividerX + 2, feeY);
        doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);
      }

      if (!(extraFeeName && extraFeeAmount)) {
        feeY += 5;
        doc.text("", xOffset + 4, feeY);
        doc.text("", feeDividerX + 2, feeY);
        doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);
      }

      feeY += 5;
      doc.setFont("times", "bold");
      doc.text("Total Amount", xOffset + 4, feeY);
      doc.text(safeText(totalAmount), feeDividerX + 2, feeY);
      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

      feeY += 5;
      doc.text("After due date", xOffset + 4, feeY);
      doc.text(safeText(lateFeeTotalAmount), feeDividerX + 2, feeY);

      currentY += feeBoxHeight + 8;

      // Parent Note Box
      const parentBoxHeight = 14;
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, parentBoxHeight);

      let noteY = currentY + 4;
      doc.setFontSize(7);
      doc.setFont("times", "normal");
      doc.text("Dear parents", xOffset + 4, noteY);
      noteY += 4;
      doc.text(
        safeText(
          `Fee paid after due date is subjected to a fine of rupees Rs/${lateFee} per month.`
        ),
        xOffset + 4,
        noteY,
        { maxWidth: sectionWidth - 8 }
      );
      noteY += 4;
      doc.text(
        "Fee once paid is not refundable and non transferable",
        xOffset + 4,
        noteY,
        { maxWidth: sectionWidth - 8 }
      );

      currentY += parentBoxHeight + 3;

      // Signature
      const signatureY = margin + sectionHeight - 10;
      doc.setFontSize(8);
      doc.text("(Signature & Stamp)", xOffset + sectionWidth / 2, signatureY, {
        align: "center",
      });
    };

    drawChallan(margin, "Bank Copy");
    drawChallan(margin + sectionWidth, "Office Copy");
    drawChallan(margin + sectionWidth * 2, "Student Copy");

    /** ⬇️ instead of blob, get base64 */
    const pdfBase64 = doc.output("datauristring").split(",")[1];

    // put into a temp file first
    const tmpFileUri =
      FileSystem.cacheDirectory + `${studentName} (${formattedMonth}).pdf`;
    await FileSystem.writeAsStringAsync(tmpFileUri, pdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const filename = `${formattedMonth}.pdf`;

    if (Platform.OS === "android") {
      // ask for the Grader folder like before
      const graderUri = await getGraderFolderUri(["Challans"]);

      // create an empty PDF file there
      const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
        graderUri,
        filename,
        "application/pdf"
      );

      // read temp file back into base64
      const base64 = await FileSystem.readAsStringAsync(tmpFileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // write base64 into SAF file
      await FileSystem.writeAsStringAsync(newUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("Success ✅", `PDF saved to ${APP_NAME} folder`);
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tmpFileUri, {
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert("Downloaded ✅", `Saved to app cache: ${uri}`);
      }
    }
  } catch (error) {
    Alert.alert("Error Occured ❌", `Could not generate Challan`);
  }
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const assetImages = [
  require("../assets/bg.png"),
  require("../assets/email.png"),
  require("../assets/lock.png"),
  require("../assets/logo_round_white.png"),
  require("../assets/Logo_White.png"),
  require("../assets/logo.png"),
  require("../assets/not_found.png"),
  require("../assets/robot.png"),
  require("../assets/user_female.png"),
  require("../assets/user_male.png"),
];

const BASE_URL = "https://owner.graderlms.com/api";
// const BASE_URL = "http://757554055b03.ngrok-free.app/api";

export {
  assetImages,
  BASE_URL,
  createDummyPDF,
  formatCNIC,
  formatNumber,
  generateChallan,
  getGraderFolderUri,
  hexToRgba,
  isValidEmail
};

