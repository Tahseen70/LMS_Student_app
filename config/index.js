import { decode, encode } from "base-64";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import moment from "moment";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Alert } from "react-native";
// Polyfill first
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// // then later, when you need jsPDF:
// let jsPDF; // will hold the module

// async function getJsPDF() {
//   if (!jsPDF) {
//     const module = await import("jspdf");
//     jsPDF = module; // or module.default.jsPDF depending on version
//   }
//   return jsPDF;
// }

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

const BASE_URL = "https://764c3240b4a0.ngrok-free.app/api";

// async function generateChallan(fee, bank, campusStr) {
//   try {
//     const { status } = await MediaLibrary.requestPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission required",
//         "Please allow access to media library"
//       );
//       return;
//     }

//     const campus = JSON.parse(campusStr);
//     const schoolName = campus.school.name;
//     const campusName = campus.name;

//     // create one page
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([842, 595]); // A4 landscape in points
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     const pageWidth = page.getWidth();
//     const pageHeight = page.getHeight();
//     const margin = 20;
//     const sectionWidth = (pageWidth - margin * 2) / 3;
//     const sectionHeight = pageHeight - margin * 2;

//     const drawChallan = (xOffset, title) => {
//       const draw = (text, x, y, size = 10, bold = false) => {
//         page.drawText(text, {
//           x,
//           y,
//           size,
//           font,
//           color: rgb(0, 0, 0),
//         });
//       };

//       // Outer border
//       page.drawRectangle({
//         x: xOffset,
//         y: margin,
//         width: sectionWidth,
//         height: sectionHeight,
//         borderColor: rgb(0, 0, 0),
//         borderWidth: 1,
//       });

//       // Title (Bank Copy / Office Copy / Student Copy)
//       draw(title, xOffset + sectionWidth / 2 - 30, pageHeight - 40, 12);

//       // Example content
//       draw(`${schoolName}`, xOffset + 10, pageHeight - 60, 10);
//       draw(`${campusName}`, xOffset + 10, pageHeight - 75, 9);
//       draw(`Student: ${fee.student.name}`, xOffset + 10, pageHeight - 100, 9);
//       draw(
//         `Father: ${fee.student.fatherName}`,
//         xOffset + 10,
//         pageHeight - 115,
//         9
//       );
//       draw(`Class: ${fee.class.name}`, xOffset + 10, pageHeight - 130, 9);
//       draw(`Fee: ${fee.amount}`, xOffset + 10, pageHeight - 160, 9);
//       draw(
//         `Total: ${fee.amount + fee.lmsFee}`,
//         xOffset + 10,
//         pageHeight - 175,
//         10
//       );
//     };

//     drawChallan(margin, "Bank Copy");
//     drawChallan(margin + sectionWidth, "Office Copy");
//     drawChallan(margin + sectionWidth * 2, "Student Copy");

//     // save base64
//     const base64 = await pdfDoc.saveAsBase64();
//     const fileUri = `${FileSystem.cacheDirectory}challan_${Date.now()}.pdf`;

//     await FileSystem.writeAsStringAsync(fileUri, base64, {
//       encoding: FileSystem.EncodingType.Base64,
//     });

//     await MediaLibrary.saveToLibraryAsync(fileUri);
//     Alert.alert("✅ PDF Created", "Challan PDF saved to gallery.");
//     return fileUri;
//   } catch (err) {
//     console.error("Challan PDF Error:", err);
//     Alert.alert("❌ Error", "Failed to generate challan");
//   }
// }

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

async function getImageBase64(url) {
  // download to a temp file
  const fileUri = FileSystem.cacheDirectory + `logo_${Date.now()}.png`;
  const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
  const { uri } = await downloadResumable.downloadAsync();

  // read as base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64; // only the base64 data, no data:image/png prefix
}

const generateChallan = async (fee, bank, campusStr) => {
  try {
    const module = await import("jspdf");
    const jsPDF = module.jsPDF;
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
      doc.text(schoolName, xOffset + sectionWidth / 2, currentY, {
        align: "center",
      });
      currentY += 6;

      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.text(campusName, xOffset + sectionWidth / 2, currentY, {
        align: "center",
      });
      if (schoolPhoneNumber) {
        currentY += 5;
        doc.text("Phone: 0515953129", xOffset + sectionWidth / 2, currentY, {
          align: "center",
        });
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
        doc.text(accountNumber[i], x + boxSize / 2, currentY + 4, {
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
      doc.text(bankName, xOffset + sectionWidth / 2 + 4, currentY + 4);

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
      doc.text(bankTitle, xOffset + sectionWidth / 2 + 4, currentY + 4);

      // Copy Title
      currentY += 8;
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.rect(xOffset + 2, currentY, sectionWidth - 4, 6);
      doc.text(title, xOffset + sectionWidth / 2, currentY + 4, {
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

          doc.text(row[0], leftLabelX, infoY);
          doc.line(leftDividerX, rowTop, leftDividerX, rowBottom);
          doc.text(row[2], leftDividerX + 2, infoY);

          const rightLabelX = dividerX + 4;
          const rightDividerX = dividerX + labelWidth;

          doc.text(row[1], rightLabelX, infoY);
          doc.line(rightDividerX, rowTop, rightDividerX, rowBottom);
          doc.text(row[3], rightDividerX + 2, infoY);
        } else {
          doc.text(row[0], xOffset + 4, infoY);
          doc.text(row[1], dividerX + 4, infoY);
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
      doc.text(formattedFeeLabel, xOffset + 4, feeY);
      doc.text(feeAmount, feeDividerX + 2, feeY);
      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

      feeY += 5;
      doc.text("LMS fees", xOffset + 4, feeY);
      doc.text(lmsFee, feeDividerX + 2, feeY);
      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);
      if (outstandingFee) {
        feeY += 5;
        doc.text("Outstanding", xOffset + 4, feeY);
        doc.text(outstandingFee, feeDividerX + 2, feeY);
        doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);
      }

      if (extraFeeName && extraFeeAmount) {
        feeY += 5;
        doc.text(extraFeeName, xOffset + 4, feeY);
        doc.text(extraFeeAmount, feeDividerX + 2, feeY);
        doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);
      }

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
      doc.text(totalAmount, feeDividerX + 2, feeY);
      doc.line(xOffset + 2, feeY + 1, xOffset + sectionWidth - 2, feeY + 1);

      feeY += 5;
      doc.text("After due date", xOffset + 4, feeY);
      doc.text(lateFeeTotalAmount, feeDividerX + 2, feeY);

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
        `Fee paid after due date is subjected to a fine of rupees Rs/${lateFee} per month.`,
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

    // make sure we have write permission first
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to save the PDF.");
      return;
    }

    // write the base64 string to a temp file
    const fileUri = FileSystem.cacheDirectory + `challan_${Date.now()}.pdf`;
    await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // save into the user’s downloads / gallery
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.createAlbumAsync("Download", asset, false);

    Alert.alert("Saved", "PDF has been saved to your Downloads/Gallery");
    return fileUri; // you also get the file path if you want to share
  } catch (error) {
    console.log(error);
  }
};

export {
  BASE_URL,
  createDummyPDF,
  formatCNIC,
  formatNumber,
  generateChallan,
  hexToRgba
};

