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

const BASE_URL = "https://owner.mytokenmaker.com/api";

export { BASE_URL, formatCNIC, hexToRgba };

