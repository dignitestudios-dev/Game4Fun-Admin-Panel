import toast from "react-hot-toast";
import { DATE_CONFIG } from "../config/constants";

// Date formatting utilities
export const formatDate = (date, format = DATE_CONFIG.format) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US");
};

// String utilities
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50) => {
  if (!str) return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

// Number utilities
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercentage = (num, fractionDigits = 2) => {
  return num
    ? num > 0
      ? `+${num?.toFixed(fractionDigits)}%`
      : `${num?.toFixed(fractionDigits)}%`
    : "0%";
};

export const getTrend = (num) => {
  if (num > 0) return "up";
  if (num < 0) return "down";
  return "neutral";
};

// Array utilities
export const sortBy = (array, key, direction = "asc") => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

export const filterBy = (array, filters) => {
  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]+$/;
  return re.test(phone);
};

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const handleError = (error) => {
  console.log(error);
  toast.error(
    error?.message || error?.response?.data?.message || "Something went wrong"
  );
};

export const handleSuccess = (message, customMessage) => {
  toast.success(message || customMessage || "Operation successful", {
    style: { textTransform: "capitalize" },
  });
};

export const appendArrayToFormData = (formData, key, arr) => {
  if (arr && Array.isArray(arr)) {
    arr.forEach((val, i) => {
      formData.append(`${key}[${i}]`, val);
    });
  }
};

export const mapProductToFormValues = (product) => {
  return {
    productName: product.productName || "",
    description: product.description || "",
    price: product.price || "",
    images:
      product.images?.map((img) => ({
        _id: img._id,
        url: img.file, // ✅ use `file` from response
      })) || [],

    details: {
      cpu: product.details?.cpu || "",
      cpuCase: product.details?.cpuCase || "",
      cpuCommonAlgorithmsBenchmark:
        product.details?.cpuCommonAlgorithmsBenchmark || "",
      cpuCooler: product.details?.cpuCooler || "",
      cpuMathematicalOperationsBenchmark:
        product.details?.cpuMathematicalOperationsBenchmark || "",
      cpuMultiCoreBenchmark: product.details?.cpuMultiCoreBenchmark || "",
      diskAppIOBenchmark: product.details?.diskAppIOBenchmark || "",
      diskRandomAccessBenchmark:
        product.details?.diskRandomAccessBenchmark || "",
      diskSeauentialReadBenchmark:
        product.details?.diskSeauentialReadBenchmark || "",
      diskSeauentialWriteBenchmark:
        product.details?.diskSeauentialWriteBenchmark || "",
      gpu: product.details?.gpu || "",
      gpuManufactured: product.details?.gpuManufactured || "",
      graphicCardBenchmark: product.details?.graphicCardBenchmark || "",
      graphicCards: product.details?.graphicCards || "",
      motherboard: product.details?.motherboard || "",
      operatingSystems: product.details?.operatingSystems || "",
      pcRam: product.details?.pcRam || "",
      powerSupply: product.details?.powerSupply || "",
      processor: product.details?.processor || "",
      processorBenchmark: product.details?.processorBenchmark || "",
      processorManufactured: product.details?.processorManufactured || "",
      ram: product.details?.ram || "",
      ramAccessBenchmark: product.details?.ramAccessBenchmark || "",
      ramBenchmark: product.details?.ramBenchmark || "",
      ramManufactured: product.details?.ramManufactured || "",
      rgbFans: product.details?.rgbFans || "",
      storage: product.details?.storage || "",
      threeDBrutalistBenchmark: product.details?.threeDBrutalistBenchmark || "",
      threeDCoastlineOpenGLBenchmark:
        product.details?.threeDCoastlineOpenGLBenchmark || "",
    },

    supportedGames:
      product.supportedGames?.map((g) => ({
        _id: g._id,
        gameName: g.gameName || "",
        gameDescription: g.description || "",
        gameImage: g.image
          ? { url: g.image } // ✅ also fix here (file, not url)
          : null,
        ultraMinimumFPS: g.ultraMinimumFPS || "",
        ultraAverageFPS: g.ultraAverageFPS || "",
        ultraMaximumFPS: g.ultraMaximumFPS || "",
        highMinimumFPS: g.highMinimumFPS || "",
        highAverageFPS: g.highAverageFPS || "",
        highMaximumFPS: g.highMaximumFPS || "",
        mediumMinimumFPS: g.mediumMinimumFPS || "",
        mediumAverageFPS: g.mediumAverageFPS || "",
        mediumMaximumFPS: g.mediumMaximumFPS || "",
        lowMinimumFPS: g.lowMinimumFPS || "",
        lowAverageFPS: g.lowAverageFPS || "",
        lowMaximumFPS: g.lowMaximumFPS || "",
      })) || [],
  };
};

// Helpers to detect File-like objects
const isFile = (f) => typeof File !== "undefined" && f instanceof File;
const isServerImageObject = (obj) => obj && (obj._id || obj.url || obj.file);

// ──────────────────────────────────────────────────────────────────────────────
// Build FormData for CREATE (flat structure; matches your earlier create logic)
// ──────────────────────────────────────────────────────────────────────────────
export const buildCreateFormData = (data = {}) => {
  const formData = new FormData();

  // Scalars / top-level
  formData.append("productName", data.productName ?? "");
  formData.append("description", data.description ?? "");
  formData.append("price", data.price ?? "");

  // Core Specs (flat)
  formData.append("cpu", data.cpu ?? "");
  formData.append("cpuCooler", data.cpuCooler ?? "");
  formData.append("motherboard", data.motherboard ?? "");
  formData.append("powerSupply", data.powerSupply ?? "");
  formData.append("graphicCards", data.graphicCards ?? "");
  formData.append("ram", data.ram ?? "");
  formData.append("storage", data.storage ?? "");
  formData.append("cpuCase", data.cpuCase ?? "");
  formData.append("rgbFans", data.rgbFans ?? "");
  formData.append("operatingSystems", data.operatingSystems ?? "");

  // Manufacturer
  formData.append("processorManufactured", data.processorManufactured ?? "");
  formData.append("processor", data.processor ?? "");
  formData.append("gpuManufactured", data.gpuManufactured ?? "");
  formData.append("ramManufactured", data.ramManufactured ?? "");

  // Capacities
  formData.append("gpu", data.gpu ?? "");
  formData.append("pcRam", data.pcRam ?? "");

  // Benchmarks (flat)
  formData.append("processorBenchmark", data.processorBenchmark ?? "");
  formData.append(
    "cpuMathematicalOperationsBenchmark",
    data.cpuMathematicalOperationsBenchmark ?? ""
  );
  formData.append(
    "cpuCommonAlgorithmsBenchmark",
    data.cpuCommonAlgorithmsBenchmark ?? ""
  );
  formData.append("cpuMultiCoreBenchmark", data.cpuMultiCoreBenchmark ?? "");
  formData.append("ramBenchmark", data.ramBenchmark ?? "");
  formData.append("ramAccessBenchmark", data.ramAccessBenchmark ?? "");
  formData.append("diskAppIOBenchmark", data.diskAppIOBenchmark ?? "");
  formData.append(
    "diskRandomAccessBenchmark",
    data.diskRandomAccessBenchmark ?? ""
  );
  formData.append(
    "diskSeauentialReadBenchmark",
    data.diskSeauentialReadBenchmark ?? ""
  );
  formData.append(
    "diskSeauentialWriteBenchmark",
    data.diskSeauentialWriteBenchmark ?? ""
  );
  formData.append("graphicCardBenchmark", data.graphicCardBenchmark ?? "");
  formData.append(
    "threeDCoastlineOpenGLBenchmark",
    data.threeDCoastlineOpenGLBenchmark ?? ""
  );
  formData.append(
    "threeDBrutalistBenchmark",
    data.threeDBrutalistBenchmark ?? ""
  );

  // also include status flags if present
  if (typeof data.isActive !== "undefined")
    formData.append("isActive", data.isActive);
  if (typeof data.isFeatured !== "undefined")
    formData.append("isFeatured", data.isFeatured);

  // Games array: accept data.games OR data.supportedGames
  const gamesArray = data.games ?? data.supportedGames ?? [];
  gamesArray.forEach((g = {}, i) => {
    formData.append(`gameName[${i}]`, g.gameName ?? "");
    formData.append(`gameDescription[${i}]`, g.gameDescription ?? "");

    // game image: if it's a File, append as gamesImages (server expects files under same key)
    if (isFile(g.gameImage)) {
      formData.append("gamesImages", g.gameImage);
    } else if (isServerImageObject(g.gameImage) && g.gameImage._id) {
      // if client passed existing server object, send its id so backend can link it
      formData.append(`existingGameImageId[${i}]`, g.gameImage._id);
    }

    // per-game FPS arrays (create expects flat FPS arrays per index)
    formData.append(`ultraMinimumFPS[${i}]`, g.ultraMinimumFPS ?? "");
    formData.append(`ultraAverageFPS[${i}]`, g.ultraAverageFPS ?? "");
    formData.append(`ultraMaximumFPS[${i}]`, g.ultraMaximumFPS ?? "");

    formData.append(`highMinimumFPS[${i}]`, g.highMinimumFPS ?? "");
    formData.append(`highAverageFPS[${i}]`, g.highAverageFPS ?? "");
    formData.append(`highMaximumFPS[${i}]`, g.highMaximumFPS ?? "");

    formData.append(`mediumMinimumFPS[${i}]`, g.mediumMinimumFPS ?? "");
    formData.append(`mediumAverageFPS[${i}]`, g.mediumAverageFPS ?? "");
    formData.append(`mediumMaximumFPS[${i}]`, g.mediumMaximumFPS ?? "");

    formData.append(`lowMinimumFPS[${i}]`, g.lowMinimumFPS ?? "");
    formData.append(`lowAverageFPS[${i}]`, g.lowAverageFPS ?? "");
    formData.append(`lowMaximumFPS[${i}]`, g.lowMaximumFPS ?? "");
  });

  // Product images (new files only)
  if (data.images?.length) {
    data.images.forEach((img) => {
      // If ImageUploader provides File objects, append them directly
      if (isFile(img)) formData.append("images", img);
      // If the uploader provides an object with `file`/`url` (server image), you can optionally send its id
      else if (isServerImageObject(img) && img._id) {
        formData.append(`existingImages[]`, img._id); // optional - backend may accept
      }
    });
  }

  return formData;
};

// ──────────────────────────────────────────────────────────────────────────────
// Build FormData for UPDATE (nested `details[...]`, nested games as supportedGames)
// ──────────────────────────────────────────────────────────────────────────────
export const buildUpdateFormData = (
  data = {},
  editingProduct,
  removeProductImages = []
) => {
  if (!editingProduct || !editingProduct._id) {
    throw new Error("editingProduct with _id is required for update form data");
  }

  const formData = new FormData();
  // product id (backend expects productId in body)
  formData.append("productId", editingProduct._id);

  // Top-level basic fields
  formData.append("productName", data.productName ?? "");
  formData.append("description", data.description ?? "");
  formData.append("price", data.price ?? "");

  // DETAILS (nested)
  // List of all detail keys you used in onSubmit
  const detailKeys = [
    // core & manufacturers & capacities
    "processorManufactured",
    "processor",
    "gpuManufactured",
    "ramManufactured",
    "cpu",
    "cpuCooler",
    "motherboard",
    "graphicCards",
    "gpu",
    "pcRam",
    "ram",
    "storage",
    "cpuCase",
    "rgbFans",
    "operatingSystems",
    "powerSupply",

    // benchmarks
    "processorBenchmark",
    "cpuMathematicalOperationsBenchmark",
    "cpuCommonAlgorithmsBenchmark",
    "cpuMultiCoreBenchmark",
    "ramBenchmark",
    "ramAccessBenchmark",
    "diskAppIOBenchmark",
    "diskRandomAccessBenchmark",
    "diskSeauentialReadBenchmark",
    "diskSeauentialWriteBenchmark",
    "graphicCardBenchmark",
    "threeDCoastlineOpenGLBenchmark",
    "threeDBrutalistBenchmark",
  ];

  // Data shape might be nested under data.details or at top-level; support both.
  detailKeys.forEach((key) => {
    const value = data.details?.[key] ?? data[key] ?? "";
    formData.append(`${key}`, value ?? "");
  });

  // supportedGames (nested objects) - prefer data.supportedGames then data.games
  // const gamesArray = data.supportedGames ?? data.games ?? [];
  // gamesArray.forEach((g = {}, i) => {
  //   formData.append(`supportedGames[${i}][gameName]`, g.gameName ?? "");
  //   formData.append(`supportedGames[${i}][gameDescription]`, g.gameDescription ?? "");

  //   // gameImage: File or existing server image
  //   if (isFile(g.gameImage)) {
  //     // send new file(s) under a files key that backend accepts
  //     // using the same key as create for files for consistency
  //     formData.append("gamesImages", g.gameImage);
  //   } else if (isServerImageObject(g.gameImage) && g.gameImage._id) {
  //     // tell backend this supportedGame already has an image by id
  //     formData.append(`supportedGames[${i}][gameImageId]`, g.gameImage._id);
  //   }

  //   // FPS values nested
  //   formData.append(`supportedGames[${i}][ultraMinimumFPS]`, g.ultraMinimumFPS ?? "");
  //   formData.append(`supportedGames[${i}][ultraAverageFPS]`, g.ultraAverageFPS ?? "");
  //   formData.append(`supportedGames[${i}][ultraMaximumFPS]`, g.ultraMaximumFPS ?? "");

  //   formData.append(`supportedGames[${i}][highMinimumFPS]`, g.highMinimumFPS ?? "");
  //   formData.append(`supportedGames[${i}][highAverageFPS]`, g.highAverageFPS ?? "");
  //   formData.append(`supportedGames[${i}][highMaximumFPS]`, g.highMaximumFPS ?? "");

  //   formData.append(`supportedGames[${i}][mediumMinimumFPS]`, g.mediumMinimumFPS ?? "");
  //   formData.append(`supportedGames[${i}][mediumAverageFPS]`, g.mediumAverageFPS ?? "");
  //   formData.append(`supportedGames[${i}][mediumMaximumFPS]`, g.mediumMaximumFPS ?? "");

  //   formData.append(`supportedGames[${i}][lowMinimumFPS]`, g.lowMinimumFPS ?? "");
  //   formData.append(`supportedGames[${i}][lowAverageFPS]`, g.lowAverageFPS ?? "");
  //   formData.append(`supportedGames[${i}][lowMaximumFPS]`, g.lowMaximumFPS ?? "");
  // });

  // Product images: include new Files under "images" and send existing image ids as existingImages[]
  if (data.images?.length) {
    data.images.forEach((img) => {
      if (img instanceof File) {
        // New uploaded image → append binary
        formData.append("images", img);
      }
    });
  }

  // Remove images list (IDs)
  if (removeProductImages?.length > 0) {
    removeProductImages.forEach((id, idx) => {
      formData.append(`removeProductImage[${idx}]`, id);
    });
  }

  // // status flags if provided
  // if (typeof data.isActive !== "undefined") formData.append("isActive", data.isActive);
  // if (typeof data.isFeatured !== "undefined") formData.append("isFeatured", data.isFeatured);

  return formData;
};
