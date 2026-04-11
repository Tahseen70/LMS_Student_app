import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode, encode } from "base-64";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import moment from "moment";
import { Alert, Platform } from "react-native";
import { File, Paths } from "expo-file-system";
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
      defaultDirectoryUri,
    );
  if (!perms.granted) throw new Error("Permission denied");

  // Create or get /Grader under DCIM
  const graderUri = await ensureSubfolder(perms.directoryUri, APP_NAME);

  await AsyncStorage.setItem("baseUri", graderUri);
  return graderUri;
};

const ensureSubfolder = async (parentUri, folderName) => {
  const children =
    await FileSystem.StorageAccessFramework.readDirectoryAsync(parentUri);

  const match = children.find((uri) => {
    const name = decodeURIComponent(uri.split("%2F").pop());
    return name === folderName;
  });

  if (match) return match;

  return await FileSystem.StorageAccessFramework.makeDirectoryAsync(
    parentUri,
    folderName,
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

const generateChallan = async (fee, bank) => {
  try {
    const safeText = (val) =>
      val !== undefined && val !== null ? String(val) : "";

    // Objects
    const student = fee.student;
    const studentClass = fee.class;
    const campus = fee.campus;
    const school = fee.school;

    // Dates
    const dueDate = fee.dueDate;
    const formattedDueDate = moment(dueDate).format("DD-MMM-YYYY");

    const month = fee.month;
    const formattedMonth = moment(month).format("MMM, YYYY");
    const formattedFeeLabel = `Fee (${moment(month).format("MMM-YYYY")})`;

    // Amounts (✅ desktop logic aligned)
    const baseAmountRaw = fee.baseAmount || fee.amount;
    const discountRaw = fee.feeDiscount || 0;

    const baseAmount = formatNumber(baseAmountRaw);
    const feeDiscount = formatNumber(discountRaw);
    const feeAmount = formatNumber(fee.amount);

    const lmsFee = formatNumber(fee.lmsFee);

    const outstandingRaw = fee.previousBalance || 0;
    const outstandingFee = outstandingRaw ? formatNumber(outstandingRaw) : 0;

    const extraRaw = fee.extraFeeAmount || 0;
    const extraFeeName = fee.extraFeeName;
    const extraFeeAmount = formatNumber(extraRaw);

    const lateFee = formatNumber(fee.lateFee);

    const totalAmount = formatNumber(
      fee.amount + outstandingRaw + fee.lmsFee + extraRaw,
    );

    const lateFeeTotalAmount = formatNumber(
      fee.amount + outstandingRaw + fee.lmsFee + fee.lateFee + extraRaw,
    );

    const issueDate = moment(fee.createdAt).format("DD-MMM-YYYY");

    // School & Campus
    const campusName = campus.name;
    const schoolName = school.name;
    const schoolLogo = school.logoUrl;
    const schoolPhoneNumber = campus?.phoneNumber;

    const pngUrl = schoolLogo.replace("/upload/", "/upload/f_png/");
    const logoBase64 = await getImageBase64(pngUrl);

    // Bank
    const bankName = `${bank.name} Bank`;
    const bankTitle = bank.title;
    const bankAccount = safeText(bank.account);

    // Student
    const studentName = student.name;
    const fatherName = student.fatherName;
    const formattedClass = `${studentClass.name}-${studentClass.section} (${studentClass.timeDuration.name})`;

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

      doc.rect(xOffset, margin, sectionWidth, sectionHeight);

      // Logo
      doc.addImage(
        logoBase64,
        "PNG",
        xOffset + sectionWidth / 2 - 8,
        12,
        16,
        16,
      );

      currentY = 35;

      // Header
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
          `Phone: ${safeText(schoolPhoneNumber)}`,
          xOffset + sectionWidth / 2,
          currentY,
          { align: "center" },
        );
      }

      currentY += 7;

      // ✅ Account number boxes (same as desktop)
      const boxSize = 5;
      const totalWidth = bankAccount.length * boxSize;
      const startX = xOffset + sectionWidth / 2 - totalWidth / 2;

      for (let i = 0; i < bankAccount.length; i++) {
        const x = startX + i * boxSize;
        doc.rect(x, currentY, boxSize, 6);
        doc.text(bankAccount[i], x + boxSize / 2, currentY + 4, {
          align: "center",
        });
      }

      currentY += 10;

      // Bank rows
      const drawRow = (label, value) => {
        doc.rect(xOffset + 2, currentY, sectionWidth - 4, 6);
        doc.line(
          xOffset + sectionWidth / 2,
          currentY,
          xOffset + sectionWidth / 2,
          currentY + 6,
        );
        doc.text(label, xOffset + 4, currentY + 4);
        doc.text(safeText(value), xOffset + sectionWidth / 2 + 4, currentY + 4);
        currentY += 8;
      };

      drawRow("Bank Name", bankName);
      drawRow("Title", bankTitle);

      // Title
      doc.setFont("times", "bold");
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, 6);
      doc.text(title, xOffset + sectionWidth / 2, currentY + 4, {
        align: "center",
      });

      currentY += 10;

      // Student Info (kept structure, safer formatting)
      const info = [
        ["Comp No:", "Month:", "1234", formattedMonth],
        ["Student's Name:", safeText(studentName)],
        ["Father's Name:", safeText(fatherName)],
        ["Class/Section:", safeText(formattedClass)],
        ["Issue Date:", "Due Date:", issueDate, formattedDueDate],
        ["Slip No#:", safeText(fee.slipNo || "")],
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

      doc.setFontSize(8);

      let infoY = currentY + rowHeight / 2 + 1;

      info.forEach((row) => {
        if (row.length === 4) {
          doc.setFont("times", "bold");
          doc.text(safeText(row[0]), xOffset + 4, infoY);

          doc.setFont("times", "normal");
          doc.text(safeText(row[2]), xOffset + 24, infoY);

          doc.setFont("times", "bold");
          doc.text(safeText(row[1]), dividerX + 4, infoY);

          doc.setFont("times", "normal");
          doc.text(safeText(row[3]), dividerX + 24, infoY);
        } else {
          doc.setFont("times", "bold");
          doc.text(safeText(row[0]), xOffset + 4, infoY);

          doc.setFont("times", "normal");
          doc.text(safeText(row[1]), dividerX + 4, infoY);
        }

        infoY += rowHeight;
      });

      currentY += studentBoxHeight + 5;

      // =========================
      // ✅ DYNAMIC FEE TABLE (desktop aligned)
      // =========================

      let rows = [];

      if (discountRaw > 0) {
        rows.push(["Tuition Fee", baseAmount]);
        rows.push(["Discount (-)", `-${feeDiscount}`]);
      } else {
        rows.push([formattedFeeLabel, feeAmount]);
      }

      rows.push(["LMS Fee", lmsFee]);

      if (outstandingRaw) {
        rows.push(["Outstanding", outstandingFee]);
      }

      if (extraFeeName && extraRaw) {
        rows.push([extraFeeName, extraFeeAmount]);
      }

      rows.push(["Total Amount", totalAmount]);
      rows.push(["After due date", lateFeeTotalAmount]);

      const rowH = 5;
      const feeBoxHeight = (rows.length + 1) * rowH;

      doc.rect(xOffset + 2, currentY, sectionWidth - 4, feeBoxHeight);

      const feeDividerX = xOffset + sectionWidth - 30;
      doc.line(feeDividerX, currentY, feeDividerX, currentY + feeBoxHeight);

      let feeY = currentY + 4;

      doc.setFont("times", "bold");
      doc.text("Particulars", xOffset + 4, feeY);
      doc.text("Amount", feeDividerX + 2, feeY);

      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

      feeY += rowH;
      doc.setFont("times", "normal");

      rows.forEach(([label, value]) => {
        if (label === "Total Amount") {
          doc.setFont("times", "bold");
        }

        doc.text(safeText(label), xOffset + 4, feeY);
        doc.text(safeText(value), feeDividerX + 2, feeY);

        doc.setFont("times", "normal");
        doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

        feeY += rowH;
      });

      currentY += feeBoxHeight + 8;

      // Footer
      const parentBoxHeight = 14;
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, parentBoxHeight);

      doc.setFontSize(7);
      doc.text("Dear parents", xOffset + 4, currentY + 4);

      doc.text(
        `Fee paid after due date is subjected to a fine of rupees Rs/${lateFee} per month.`,
        xOffset + 4,
        currentY + 8,
        { maxWidth: sectionWidth - 8 },
      );

      doc.text(
        "Fee once paid is not refundable and non transferable",
        xOffset + 4,
        currentY + 12,
        { maxWidth: sectionWidth - 8 },
      );

      const signatureY = margin + sectionHeight - 10;
      doc.setFontSize(8);
      doc.text("(Signature & Stamp)", xOffset + sectionWidth / 2, signatureY, {
        align: "center",
      });
    };

    drawChallan(margin, "Bank Copy");
    drawChallan(margin + sectionWidth, "Office Copy");
    drawChallan(margin + sectionWidth * 2, "Student Copy");

    const filename = `${formattedMonth}.pdf`;
    const pdfBytes = doc.output("arraybuffer");

    const bytes = new Uint8Array(pdfBytes);

    const cacheFile = new File(Paths.cache, filename);
    await cacheFile.write(bytes);

    const cacheUri = cacheFile.uri;

    if (Platform.OS === "android") {
      const graderUri = await getGraderFolderUri(["Challans"]);

      const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
        graderUri,
        filename,
        "application/pdf",
      );

      const file = new File(newUri);
      file.write(bytes);

      Alert.alert("Success ✅", `PDF saved`);
      return { uri: newUri, filename, type: "application/pdf" };
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(cacheUri, {
          mimeType: "application/pdf",
        });
      }

      return { uri: cacheUri, filename, type: "application/pdf" };
    }
  } catch (error) {
    console.error("❌ Generate Challan Error:", error);
    Alert.alert("Error Occured ❌", "Could not generate Challan");
    return null;
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

const getExtensionName = (url) => {
  try {
    const urlPath = new URL(url).pathname;
    const fileMatch = urlPath.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    if (fileMatch && fileMatch[1]) {
      return fileMatch[1].toLowerCase();
    }
    return null;
  } catch (e) {
    console.warn("⚠️ Could not parse filename from URL:", e.message);
  }
};

export {
  assetImages,
  BASE_URL,
  formatCNIC,
  formatNumber,
  generateChallan,
  getGraderFolderUri,
  hexToRgba,
  isValidEmail,
  getExtensionName,
};
