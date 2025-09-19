import { useMemo, useState } from "react";
import Select from "../components/ui/Select";
import {
  Edit,
  Trash2,
  Eye,
  Package,
  ShieldX,
  ShieldCheck,
  X,
  Loader2,
  Truck,
  MapPin,
  Star,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import {
  useForm,
  Controller,
  useFieldArray,
  useFormState,
} from "react-hook-form";
import {
  appendArrayToFormData,
  buildCreateFormData,
  buildUpdateFormData,
  formatCurrency,
  formatDate,
  formatNumber,
  mapProductToFormValues,
} from "../utils/helpers";
import Card from "../components/ui/Card";
import useGetAllProducts from "../hooks/products/useGetAllProducts";
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";
import FilterBar from "../components/ui/FilterBar";
import useDebounce from "../hooks/global/useDebounce";
import useGetAllCategories from "../hooks/categories/useGetAllCategories";
import TagInput from "../components/ui/TagInput";
import useProductActions from "../hooks/products/useProductActions";
import useCreateProduct from "../hooks/products/useCreateProduct";
import ImageUploader from "../components/ui/ImageUploader";
import ImagesGallery from "../components/ui/ImagesGallery";
import StatsCard from "../components/common/StatsCard";
import toast from "react-hot-toast";
import GameModal from "../components/ui/GameModal";

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);
  const [singleProduct, setSingleProduct] = useState();
  const [editProductImages, setEditProductImages] = useState([]);
  const [removeProductImages, setRemoveProductImages] = useState([]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [prodId, setProdId] = useState("");
  // Product hooks
  const { loading, products, stats, totalPages, totalData, getAllProducts } =
    useGetAllProducts(searchDebounce, status, currentPage, pageSize);
  const {
    loading: loadingCreateProduct,
    createProduct,
    createGame,
  } = useCreateProduct();
  const {
    loading: loadingProductActions,
    updateProduct,
    deleteProduct,
    getProductById,
    updateSupportedGame,
    deleteGame,
  } = useProductActions();
  const { loading: loadingCategories, categories } = useGetAllCategories(
    "active",
    1,
    200
  );

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showViewProductModal, setShowViewProductModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const defaultValues = {
    productName: "",
    description: "",
    price: null,
    cpu: "",
    cpuCooler: "",
    motherboard: "",
    powerSupply: "",
    graphicCards: "",
    ram: "",
    storage: "",
    cpuCase: "",
    rgbFans: "",
    operatingSystems: "",

    // Benchmarks
    processorBenchmark: null,
    cpuMathematicalOperationsBenchmark: null,
    cpuCommonAlgorithmsBenchmark: null,
    cpuMultiCoreBenchmark: null,
    ramBenchmark: null,
    ramAccessBenchmark: null,
    diskAppIOBenchmark: null,
    diskRandomAccessBenchmark: null,
    diskSeauentialReadBenchmark: null,
    diskSeauentialWriteBenchmark: null,
    graphicCardBenchmark: null,
    threeDCoastlineOpenGLBenchmark: null,
    threeDBrutalistBenchmark: null,

    // Games
    gameName: [],
    gameDescription: [],

    // GPU / RAM / Manufacturer
    gpu: null,
    pcRam: null,
    processorManufactured: "",
    processor: "",
    gpuManufactured: "",
    ramManufactured: "",

    // FPS Benchmarks
    ultraMinimumFPS: [],
    ultraAverageFPS: [],
    ultraMaximumFPS: [],

    highMinimumFPS: [],
    highAverageFPS: [],
    highMaximumFPS: [],

    mediumMinimumFPS: [],
    mediumAverageFPS: [],
    mediumMaximumFPS: [],

    lowMinimumFPS: [],
    lowAverageFPS: [],
    lowMaximumFPS: [],
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues });
  const {
    register: registerSecond,
    handleSubmit: handleSubmitSecond,
    control: controlSecond,
    getValues,
    reset: resetScond,
    formState: { errors: errorsSecond, dirtyFields },
  } = useForm({
    defaultValues: {
      productName: "",
      description: "",
      price: "",
      images: [],

      // details
      details: {
        cpu: "",
        cpuCase: "",
        cpuCommonAlgorithmsBenchmark: "",
        cpuCooler: "",
        cpuMathematicalOperationsBenchmark: "",
        cpuMultiCoreBenchmark: "",
        diskAppIOBenchmark: "",
        diskRandomAccessBenchmark: "",
        diskSeauentialReadBenchmark: "",
        diskSeauentialWriteBenchmark: "",
        gpu: "",
        gpuManufactured: "",
        graphicCardBenchmark: "",
        graphicCards: "",
        motherboard: "",
        operatingSystems: "",
        pcRam: "",
        powerSupply: "",
        processor: "",
        processorBenchmark: "",
        processorManufactured: "",
        ram: "",
        ramAccessBenchmark: "",
        ramBenchmark: "",
        ramManufactured: "",
        rgbFans: "",
        storage: "",
        threeDBrutalistBenchmark: "",
        threeDCoastlineOpenGLBenchmark: "",
      },

      // supported games (array of objects)
      supportedGames: [
        {
          gameName: "",
          gameDescription: "",
          gameImage: null,
          ultraMinimumFPS: "",
          ultraAverageFPS: "",
          ultraMaximumFPS: "",
          highMinimumFPS: "",
          highAverageFPS: "",
          highMaximumFPS: "",
          mediumMinimumFPS: "",
          mediumAverageFPS: "",
          mediumMaximumFPS: "",
          lowMinimumFPS: "",
          lowAverageFPS: "",
          lowMaximumFPS: "",
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "supportedGames", // All games stored in an array
  });
  const productStats = useMemo(
    () => [
      {
        title: "Total Products",
        value: formatNumber(stats?.totalProducts || 0),
        icon: Package,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
      {
        title: "Active Products",
        value: formatNumber(stats?.totalActiveProducts || 0),
        icon: ShieldCheck,
        color: "text-green-600",
        bgColor: "bg-green-600/20",
      },
      {
        title: "Inactive Products",
        value: formatNumber(stats?.totalInactiveProducts || 0),
        icon: ShieldX,
        color: "text-orange-600",
        bgColor: "bg-orange-600/20",
      },
    ],
    [stats]
  );

  const columns = [
    {
      key: "_id",
      label: "ID",
    },
    {
      key: "productName",
      label: "Product Name",
      render: (val) => val,
    },
    // {
    //   key: "category",
    //   label: "Category",

    //   render: (value) => value,
    // },
    {
      key: "price",
      label: "Price",

      render: (value) => formatCurrency(value),
    },
    // {
    //   key: "shippingCost",
    //   label: "Shipping Cost",

    //   render: (value) => formatCurrency(value),
    // },
    // {
    //   key: "stock",
    //   label: "Stock",

    //   render: (value) => {
    //     return value ? formatNumber(value) : "N/A";
    //   },
    // },
    // {
    //   key: "sizes",
    //   label: "Sizes",
    //   render: (sizes) => (
    //     <div className="flex flex-wrap gap-1">
    //       {sizes?.slice(0, 3).map((size, index) => (
    //         <Badge key={index} variant="outline" className="text-xs">
    //           {size}
    //         </Badge>
    //       ))}
    //       {sizes?.length > 3 && (
    //         <Badge variant="outline" className="text-xs">
    //           +{sizes.length - 3}
    //         </Badge>
    //       )}
    //     </div>
    //   ),
    // },
    // {
    //   key: "colors",
    //   label: "Colors",
    //   render: (colors) => (
    //     <div className="flex flex-wrap gap-1">
    //       {colors?.slice(0, 3).map((color, index) => (
    //         <Badge key={index} variant="outline" className="text-xs">
    //           {color}
    //         </Badge>
    //       ))}
    //       {colors?.length > 3 && (
    //         <Badge variant="outline" className="text-xs">
    //           +{colors.length - 3}
    //         </Badge>
    //       )}
    //     </div>
    //   ),
    // },
    // {
    //   key: "isActive",
    //   label: "Status",
    //   render: (isActive) => (
    //     <Badge variant={isActive ? "success" : "danger"}>
    //       {isActive ? "Active" : "Inactive"}
    //     </Badge>
    //   ),
    // },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",

      render: (_, product) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(product)}
            icon={<Eye className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(product)}
            icon={<Edit className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product._id)}
            disabled={loadingProductActions}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      ),
    },
  ];

  // For the FilterBar fix, update your formattedCategories to include the category ID:
  const formattedCategories = useMemo(() => {
    const formattedCategories = categories?.map((category) => {
      return {
        value: category._id, // Use _id instead of name for the value
        label: category.name,
      };
    });

    return [
      { value: "", label: `-- Select a Category --` },
      ...(formattedCategories || []),
    ];
  }, [categories]);

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const handleSearch = (search) => {
    setCurrentPage(1);
    setSearch(search);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    append({
      gameName: "",
      gameDescription: "",
      gameImages: null, // new field
      ultraMinimumFPS: "",
      ultraAverageFPS: "",
      ultraMaximumFPS: "",
      highMinimumFPS: "",
      highAverageFPS: "",
      highMaximumFPS: "",
      mediumMinimumFPS: "",
      mediumAverageFPS: "",
      mediumMaximumFPS: "",
      lowMinimumFPS: "",
      lowAverageFPS: "",
      lowMaximumFPS: "",
    });
    reset(defaultValues);
    setShowModal(true);
  };

  const handleEdit = async (product) => {
    // const receivingOptions =
    //   product?.receivingOptions == ["delivery"]
    //     ? "delivery"
    //     : product?.receivingOptions == ["pickup"]
    //     ? "pickup"
    //     : "both";

    // const formattedProduct = {
    //   ...product,
    //   receivingOptions: receivingOptions,
    //   // category: product.category._id,
    //   isActive: JSON.stringify(product.isActive), // Convert boolean to string
    // };

    // console.log("editing formattedProduct: ", formattedProduct);
    const res = await getProductById(product._id);
    setSingleProduct(res.product);
    setEditingProduct(product);
    setEditProductImages(res.product.images);
    resetScond(
      mapProductToFormValues({
        ...res.product,
        images: res.product.images.filter(
          (img) => !editProductImages.includes(img._id)
        ),
      })
    );
    setShowEditModal(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setShowViewProductModal(true);
  };

  const handleDelete = async (productId) => {
    console.log(productId);
    const success = await deleteProduct(productId);
    if (success) {
      getAllProducts();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const handleProductExport = (data) => {
    return data.map((product) => ({
      "Product Name": product.productName || "",
      Description: product.description || "",
      Price: formatCurrency(product.price),
      CPU: product.details?.cpu || "",
      "CPU Cooler": product.details?.cpuCooler || "",
      Motherboard: product.details?.motherboard || "",
      "Graphics Card": product.details?.graphicCards || "",
      GPU: product.details?.gpu ? `${product.details.gpu} GB` : "",
      "GPU Manufacturer": product.details?.gpuManufactured || "",
      RAM: product.details?.ram || "",
      "PC RAM": product.details?.pcRam ? `${product.details.pcRam} GB` : "",
      "RAM Manufacturer": product.details?.ramManufactured || "",
      Storage: product.details?.storage || "",
      Case: product.details?.cpuCase || "",
      "RGB Fans": product.details?.rgbFans || "",
      "Processor Manufacturer": product.details?.processorManufactured || "",
      Processor: product.details?.processor || "",
      Status: product.isDeleted
        ? "Deleted"
        : product.isActive
        ? "Active"
        : "Inactive",
      Created: formatDate(product.createdAt),
    }));
  };

  const onSubmit = async (data) => {
    try {
      let success;

      if (editingProduct) {
        const formData = buildUpdateFormData(
          data,
          editingProduct,
          removeProductImages
        );
        success = await updateProduct(formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const formData = buildCreateFormData(data);
        success = await createProduct(formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (success) {
        reset(defaultValues);
        setShowEditModal(false);
        setShowModal(false);
        getAllProducts();
      }
    } catch (error) {
      console.error("Error creating/updating product:", error);
    }
  };

  const handleUpdateSingleGame = async (data, id) => {
    // ✅ get the latest form values for this specific game

    const formData = new FormData();
    formData.append("supportedGamesId", id);

    Object.keys(data).forEach((key) => {
      let value = data[key];

      if (
        ["_id", "productId", "image", "__v", "createdAt", "updatedAt"].includes(
          key
        )
      )
        return;
      const formKey = key === "description" ? "gameDescription" : key;

      if (value instanceof File) {
        formData.append(formKey, value);
      } else if (value !== undefined && value !== null) {
        formData.append(formKey, value);
      }
    });

    const success = await updateSupportedGame(formData);
    if (success) {
      const res = await getProductById(prodId);
      setSingleProduct(res.product);

      setEditProductImages(res.product.images);
      resetScond(
        mapProductToFormValues({
          ...res.product,
          images: res.product.images.filter(
            (img) => !editProductImages.includes(img._id)
          ),
        })
      );
      setShowGameModal(false);
      setShowModal(false);
    }
  };
  console.log(errors);
  const handleCreateGame = async (data) => {
    const formData = new FormData();
    formData.append("productId", prodId);
    Object.keys(data).forEach((key) => {
      let value = data[key];

      if (
        ["_id", "productId", "image", "__v", "createdAt", "updatedAt"].includes(
          key
        )
      )
        return;
      const formKey = key === "description" ? "gameDescription" : key;

      if (value instanceof File) {
        formData.append(formKey, value);
      } else if (value !== undefined && value !== null) {
        formData.append(formKey, value);
      }
    });

    const success = await createGame(formData);
    if (success) {
      const res = await getProductById(prodId);
      setSingleProduct(res.product);
      setEditProductImages(res.product.images);
      resetScond(
        mapProductToFormValues({
          ...res.product,
          images: res.product.images.filter(
            (img) => !editProductImages.includes(img._id)
          ),
        })
      );
      setShowGameModal(false);
      setShowModal(false);
    }
  };

  const handleDeleteGame = async (id, productId) => {
    const success = await deleteGame(id);
    if (success) {
      const res = await getProductById(productId);
      setSingleProduct(res.product);
      setEditProductImages(res.product.images);
      resetScond(
        mapProductToFormValues({
          ...res.product,
          images: res.product.images.filter(
            (img) => !editProductImages.includes(img._id)
          ),
        })
      );
    }
  };
  return (
    <>
      <div className="relative z-[9999]">
        {showGameModal && (
          <GameModal
            isOpen={showGameModal}
            onClose={() => setShowGameModal(false)}
            loading={loadingProductActions}
            gameImage={editingGame.image}
            defaultValues={editingGame}
            onSave={(data) => {
              if (editingGame?._id) {
                handleUpdateSingleGame(data, editingGame._id);
              } else {
                handleCreateGame(data);
              }
            }}
          />
        )}
      </div>
      <div className="space-y-6">
        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {productStats?.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon ? <stat.icon /> : null}
            colored
            index={index}
          />
        ))}
      </div> */}

        {/* Filters */}
        {/* <Card className="p-4">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: status,
              onChange: setStatus,
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
          onClear={() => setStatus("")}
        />
      </Card> */}

        <div>
          <DataTable
            title="Products Management"
            loading={loading}
            data={products}
            columns={columns}
            onExport={handleProductExport}
            onAdd={handleAdd}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            totalData={totalData}
            searchTerm={search}
            onSearch={(value) => handleSearch(value)}
            searchable
            exportable
          />

          {/* Create Product Modal */}
          <Modal
            isOpen={showModal}
            onClose={handleModalClose}
            title={"Add New Product"}
            size="lg"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Product Name */}
              <Input
                label="Product Name"
                {...register("productName", {
                  required: "Product name is required",
                })}
                disabled={loadingCreateProduct}
                error={errors.productName?.message}
              />

              {/* Price */}
              <Input
                label="Price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                disabled={loadingCreateProduct}
                error={errors.price?.message}
              />

              {/* Core Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CPU"
                  {...register("cpu", { required: "CPU is required" })}
                  error={errors.cpu?.message}
                />
                <Input
                  label="CPU Cooler"
                  {...register("cpuCooler", {
                    required: "CPU Cooler is required",
                  })}
                  error={errors.cpuCooler?.message}
                />
                <Input
                  label="Motherboard"
                  {...register("motherboard", {
                    required: "Motherboard is required",
                  })}
                  error={errors.motherboard?.message}
                />
                <Input
                  label="Power Supply"
                  {...register("powerSupply", {
                    required: "Power supply is required",
                  })}
                  error={errors.powerSupply?.message}
                />
                <Input
                  label="Graphics Card"
                  {...register("graphicCards", {
                    required: "Graphics card is required",
                  })}
                  error={errors.graphicCards?.message}
                />
                <Input
                  label="RAM"
                  {...register("ram", { required: "RAM is required" })}
                  error={errors.ram?.message}
                />
                <Input
                  label="Storage"
                  {...register("storage", { required: "Storage is required" })}
                  error={errors.storage?.message}
                />
                <Input
                  label="Case"
                  {...register("cpuCase", { required: "Case is required" })}
                  error={errors.cpuCase?.message}
                />
                <Input
                  label="RGB Fans"
                  {...register("rgbFans", {
                    required: "RGB Fans are required",
                  })}
                  error={errors.rgbFans?.message}
                />
                <Input
                  label="Operating System"
                  {...register("operatingSystems", {
                    required: "Operating system is required",
                  })}
                  error={errors.operatingSystems?.message}
                />
              </div>

              {/* Manufacturer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Processor Manufacturer"
                  {...register("processorManufactured", {
                    required: "Processor manufacturer is required",
                  })}
                  error={errors.processorManufactured?.message}
                />
                <Input
                  label="GPU Manufacturer"
                  {...register("gpuManufactured", {
                    required: "GPU manufacturer is required",
                  })}
                  error={errors.gpuManufactured?.message}
                />
                <Input
                  label="RAM Manufacturer"
                  {...register("ramManufactured", {
                    required: "RAM manufacturer is required",
                  })}
                  error={errors.ramManufactured?.message}
                />
                <Input
                  label="Processor"
                  {...register("processor", {
                    required: "Processor is required",
                  })}
                  error={errors.processor?.message}
                />
              </div>

              {/* System Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="GPU Memory (GB)"
                  type="number"
                  {...register("gpu", { required: "GPU memory is required" })}
                  error={errors.gpu?.message}
                />
                <Input
                  label="PC RAM (GB)"
                  type="number"
                  {...register("pcRam", { required: "PC RAM is required" })}
                  error={errors.pcRam?.message}
                />
              </div>

              {/* Benchmarks */}
              <h4 className="text-md font-semibold text-white">Benchmarks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Processor Benchmark"
                  type="number"
                  {...register("processorBenchmark", {
                    required: "Processor benchmark is required",
                  })}
                  error={errors.processorBenchmark?.message}
                />
                <Input
                  label="CPU Mathematical Ops"
                  type="number"
                  {...register("cpuMathematicalOperationsBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.cpuMathematicalOperationsBenchmark?.message}
                />
                <Input
                  label="CPU Common Algorithms"
                  type="number"
                  {...register("cpuCommonAlgorithmsBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.cpuCommonAlgorithmsBenchmark?.message}
                />
                <Input
                  label="CPU Multi-core Benchmark"
                  type="number"
                  {...register("cpuMultiCoreBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.cpuMultiCoreBenchmark?.message}
                />
                <Input
                  label="RAM Benchmark"
                  type="number"
                  {...register("ramBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.ramBenchmark?.message}
                />
                <Input
                  label="RAM Access Benchmark"
                  type="number"
                  {...register("ramAccessBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.ramAccessBenchmark?.message}
                />
                <Input
                  label="Disk App IO Benchmark"
                  type="number"
                  {...register("diskAppIOBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.diskAppIOBenchmark?.message}
                />
                <Input
                  label="Disk Random Access"
                  type="number"
                  {...register("diskRandomAccessBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.diskRandomAccessBenchmark?.message}
                />
                <Input
                  label="Disk Sequential Read"
                  type="number"
                  {...register("diskSeauentialReadBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.diskSeauentialReadBenchmark?.message}
                />
                <Input
                  label="Disk Sequential Write"
                  type="number"
                  {...register("diskSeauentialWriteBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.diskSeauentialWriteBenchmark?.message}
                />
                <Input
                  label="Graphics Card Benchmark"
                  type="number"
                  {...register("graphicCardBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.graphicCardBenchmark?.message}
                />
                <Input
                  label="3D Coastline OpenGL"
                  type="number"
                  {...register("threeDCoastlineOpenGLBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.threeDCoastlineOpenGLBenchmark?.message}
                />
                <Input
                  label="3D Brutalist Benchmark"
                  type="number"
                  {...register("threeDBrutalistBenchmark", {
                    required: "This field is required",
                  })}
                  error={errors.threeDBrutalistBenchmark?.message}
                />
              </div>

              {/* Games */}

              <h4 className="text-md font-semibold text-white">Games</h4>
              {fields.map((item, index) => {
                return (
                  <div
                    key={item._id}
                    className="border border-gray-600 p-4 rounded-lg mb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-gray-200">
                        Game {index + 1}{" "}
                      </h5>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="dark:text-white text-black" />
                      </Button>
                    </div>

                    {/* Game Info */}
                    <Input
                      label="Game Name"
                      {...register(`games.${index}.gameName`, {
                        required: "Game name is required",
                      })}
                      error={errors?.games?.[index]?.gameName?.message}
                    />
                    <Input
                      label="Game Description"
                      {...register(`games.${index}.gameDescription`, {
                        required: "Game description is required",
                      })}
                      error={errors?.games?.[index]?.gameDescription?.message}
                    />

                    {/* Game Image */}
                    <Controller
                      name={`games.${index}.gameImage`}
                      control={control}
                      rules={{ required: "Game image is required" }}
                      render={({ field: { onChange, value }, fieldState }) => (
                        <ImageUploader
                          onChange={(files) => onChange(files[0])}
                          value={value ? [value] : []}
                          label="Game Image"
                          multiple={false}
                          error={fieldState.error?.message}
                          disabled={loadingCreateProduct}
                        />
                      )}
                    />
                    <span className="text-red-600 text-sm">
                      {errors.games && errors?.games?.[index].gameImage?.message}
                    </span>
                    {/* FPS Benchmarks */}
                    <h6 className="font-semibold text-gray-300 mt-3">
                      FPS Benchmarks
                    </h6>
                    {["ultra", "high", "medium", "low"].map((level) => (
                      <div
                        key={level}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
                      >
                        <Input
                          label={`${level} Min FPS`}
                          type="number"
                          {...register(`games.${index}.${level}MinimumFPS`, {
                            required: "Required",
                          })}
                          error={
                            errors?.games?.[index]?.[`${level}MinimumFPS`]
                              ?.message
                          }
                        />
                        <Input
                          label={`${level} Avg FPS`}
                          type="number"
                          {...register(`games.${index}.${level}AverageFPS`, {
                            required: "Required",
                          })}
                          error={
                            errors?.games?.[index]?.[`${level}AverageFPS`]
                              ?.message
                          }
                        />
                        <Input
                          label={`${level} Max FPS`}
                          type="number"
                          {...register(`games.${index}.${level}MaximumFPS`, {
                            required: "Required",
                          })}
                          error={
                            errors?.games?.[index]?.[`${level}MaximumFPS`]
                              ?.message
                          }
                        />
                      </div>
                    ))}

                    {/* Save Button (calls different function based on isNewGame) */}
                    {/* <Button
                      type="button"
                      className="mt-4 w-full"
                      // onClick={() => {
                      //   if (isNewGame) {
                      //     handleCreateGame(index); // call API to create new game
                      //   } else {
                      //     handleUpdateGame(index, item._id); // call API to update existing game
                      //   }
                      // }}
                    >
                   "Add Game"
                    </Button> */}
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    gameName: "",
                    gameDescription: "",
                    gameImages: null, // new field
                    ultraMinimumFPS: "",
                    ultraAverageFPS: "",
                    ultraMaximumFPS: "",
                    highMinimumFPS: "",
                    highAverageFPS: "",
                    highMaximumFPS: "",
                    mediumMinimumFPS: "",
                    mediumAverageFPS: "",
                    mediumMaximumFPS: "",
                    lowMinimumFPS: "",
                    lowAverageFPS: "",
                    lowMaximumFPS: "",
                  })
                }
              >
                Add Game
              </Button>

              {/* Description */}
              <TextArea
                label="Description"
                {...register("description", {
                  required: "Product description is required",
                })}
                rows={4}
                placeholder="Enter product description"
                error={errors.description?.message}
                disabled={loadingCreateProduct}
              />

              {/* Images */}
              <Controller
                name="images"
                control={control}
                rules={{ required: "At least one image is required" }}
                defaultValue={[]}
                render={({ field: { onChange, value }, fieldState }) => (
                  <ImageUploader
                    onChange={onChange}
                    value={value}
                    label="Product Images"
                    multiple
                    error={fieldState.error?.message}
                    disabled={loadingCreateProduct}
                    allowUpload={editingProduct ? false : true}
                  />
                )}
              />
                <span className="text-red-600 text-sm">
                      {errors.images?.message}
                    </span>

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loadingCreateProduct}
                  onClick={handleModalClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 flex items-center gap-2"
                  disabled={loadingCreateProduct || loadingProductActions}
                >
                  {loadingCreateProduct ? (
                    <div className="flex items-center justify-center py-12 gap-2">
                      <Loader2 className="animate-spin text-white" />
                      <span className="text-white">Creating...</span>
                    </div>
                  ) : loadingProductActions ? (
                    <div className="flex items-center justify-center py-12 gap-2">
                      <Loader2 className="animate-spin text-white" />
                      <span className="text-white">Updating...</span>
                    </div>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </div>
            </form>
          </Modal>

          {/*Edit*/}
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title={editingProduct ? "Edit Product" : "Create Product"}
            size="lg"
          >
            <form onSubmit={handleSubmitSecond(onSubmit)} className="space-y-4">
              {/* Product Name */}
              <Input
                label="Product Name"
                {...registerSecond("productName", {
                  required: "Product name is required",
                })}
                disabled={loadingCreateProduct}
                error={errorsSecond.productName?.message}
              />

              {/* Price */}
              <Input
                label="Price"
                type="number"
                step="0.01"
                {...registerSecond("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                disabled={loadingCreateProduct}
                error={errorsSecond.price?.message}
              />

              {/* Core Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CPU"
                  {...registerSecond("details.cpu")}
                  error={errorsSecond.details?.cpu?.message}
                />
                <Input
                  label="CPU Cooler"
                  {...registerSecond("details.cpuCooler")}
                  error={errorsSecond.details?.cpuCooler?.message}
                />
                <Input
                  label="Motherboard"
                  {...registerSecond("details.motherboard")}
                  error={errorsSecond.details?.motherboard?.message}
                />
                <Input
                  label="Power Supply"
                  {...registerSecond("details.powerSupply")}
                  error={errorsSecond.details?.powerSupply?.message}
                />
                <Input
                  label="Graphics Card"
                  {...registerSecond("details.graphicCards")}
                  error={errorsSecond.details?.graphicCards?.message}
                />
                <Input
                  label="RAM"
                  {...registerSecond("details.ram")}
                  error={errorsSecond.details?.ram?.message}
                />
                <Input
                  label="Storage"
                  {...registerSecond("details.storage")}
                  error={errorsSecond.details?.storage?.message}
                />
                <Input
                  label="Case"
                  {...registerSecond("details.cpuCase")}
                  error={errorsSecond.details?.cpuCase?.message}
                />
                <Input
                  label="RGB Fans"
                  {...registerSecond("details.rgbFans")}
                  error={errorsSecond.details?.rgbFans?.message}
                />
                <Input
                  label="Operating System"
                  {...registerSecond("details.operatingSystems")}
                  error={errorsSecond.details?.operatingSystems?.message}
                />
              </div>

              {/* Manufacturer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Processor Manufacturer"
                  {...registerSecond("details.processorManufactured")}
                  error={errorsSecond.details?.processorManufactured?.message}
                />
                <Input
                  label="GPU Manufacturer"
                  {...registerSecond("details.gpuManufactured")}
                  error={errorsSecond.details?.gpuManufactured?.message}
                />
                <Input
                  label="RAM Manufacturer"
                  {...registerSecond("details.ramManufactured")}
                  error={errorsSecond.details?.ramManufactured?.message}
                />
                <Input
                  label="Processor"
                  {...registerSecond("details.processor")}
                  error={errorsSecond.details?.processor?.message}
                />
              </div>

              {/* System Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="GPU Memory (GB)"
                  type="number"
                  {...registerSecond("details.gpu")}
                  error={errorsSecond.details?.gpu?.message}
                />
                <Input
                  label="PC RAM (GB)"
                  type="number"
                  {...registerSecond("details.pcRam")}
                  error={errorsSecond.details?.pcRam?.message}
                />
              </div>

              {/* Benchmarks */}
              <h4 className="text-md font-semibold text-white">Benchmarks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Processor Benchmark"
                  type="number"
                  {...registerSecond("details.processorBenchmark")}
                  error={errorsSecond.details?.processorBenchmark?.message}
                />
                <Input
                  label="CPU Mathematical Ops"
                  type="number"
                  {...registerSecond(
                    "details.cpuMathematicalOperationsBenchmark"
                  )}
                  error={
                    errorsSecond.details?.cpuMathematicalOperationsBenchmark
                      ?.message
                  }
                />
                <Input
                  label="CPU Common Algorithms"
                  type="number"
                  {...registerSecond("details.cpuCommonAlgorithmsBenchmark")}
                  error={
                    errorsSecond.details?.cpuCommonAlgorithmsBenchmark?.message
                  }
                />
                <Input
                  label="CPU Multi-core Benchmark"
                  type="number"
                  {...registerSecond("details.cpuMultiCoreBenchmark")}
                  error={errorsSecond.details?.cpuMultiCoreBenchmark?.message}
                />
                <Input
                  label="RAM Benchmark"
                  type="number"
                  {...registerSecond("details.ramBenchmark")}
                  error={errorsSecond.details?.ramBenchmark?.message}
                />
                <Input
                  label="RAM Access Benchmark"
                  type="number"
                  {...registerSecond("details.ramAccessBenchmark")}
                  error={errorsSecond.details?.ramAccessBenchmark?.message}
                />
                <Input
                  label="Disk App IO Benchmark"
                  type="number"
                  {...registerSecond("details.diskAppIOBenchmark")}
                  error={errorsSecond.details?.diskAppIOBenchmark?.message}
                />
                <Input
                  label="Disk Random Access"
                  type="number"
                  {...registerSecond("details.diskRandomAccessBenchmark")}
                  error={
                    errorsSecond.details?.diskRandomAccessBenchmark?.message
                  }
                />
                <Input
                  label="Disk Sequential Read"
                  type="number"
                  {...registerSecond("details.diskSeauentialReadBenchmark")}
                  error={
                    errorsSecond.details?.diskSeauentialReadBenchmark?.message
                  }
                />
                <Input
                  label="Disk Sequential Write"
                  type="number"
                  {...registerSecond("details.diskSeauentialWriteBenchmark")}
                  error={
                    errorsSecond.details?.diskSeauentialWriteBenchmark?.message
                  }
                />
                <Input
                  label="Graphics Card Benchmark"
                  type="number"
                  {...registerSecond("details.graphicCardBenchmark")}
                  error={errorsSecond.details?.graphicCardBenchmark?.message}
                />
                <Input
                  label="3D Coastline OpenGL"
                  type="number"
                  {...registerSecond("details.threeDCoastlineOpenGLBenchmark")}
                  error={
                    errorsSecond.details?.threeDCoastlineOpenGLBenchmark
                      ?.message
                  }
                />
                <Input
                  label="3D Brutalist Benchmark"
                  type="number"
                  {...registerSecond("details.threeDBrutalistBenchmark")}
                  error={
                    errorsSecond.details?.threeDBrutalistBenchmark?.message
                  }
                />
              </div>

              {/* Supported Games */}
              <h4 className="text-md font-semibold text-white">
                Supported Games
              </h4>
              <div className="space-y-3">
                {singleProduct?.supportedGames?.length > 0 ? (
                  singleProduct.supportedGames.map((game) => (
                    <div
                      key={game._id}
                      className="border border-gray-600 p-3 rounded-lg flex justify-between items-center"
                    >
                      <span className="text-gray-200">{game.gameName}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setProdId(singleProduct._id);
                            setEditingGame(game); // set selected game for modal
                            setShowGameModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            handleDeleteGame(game._id, singleProduct._id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No games added yet.</p>
                )}
              </div>

              <Button
                type="button"
                className="mt-4"
                onClick={() => {
                  setEditingGame(null);
                  setProdId(singleProduct._id); // null means new game
                  setShowGameModal(true);
                }}
              >
                Add New Game
              </Button>

              {/* Description */}
              <TextArea
                label="Description"
                {...registerSecond("description", {
                  required: "Product description is required",
                })}
                rows={4}
                placeholder="Enter product description"
                error={errorsSecond.description?.message}
                disabled={loadingCreateProduct}
              />

              {/* Product Images */}
              <Controller
                name="images"
                control={controlSecond}
                rules={{ required: "At least one image is required" }}
                defaultValue={[]}
                render={({ field: { onChange, value }, fieldState }) => (
                  <ImageUploader
                    onChange={onChange}
                    value={value}
                    label="Product Images"
                    multiple
                    error={fieldState.error?.message}
                    disabled={loadingCreateProduct}
                  />
                )}
              />
              <div className="flex flex-wrap gap-4">
                {editProductImages.map((prod, idx) => (
                  <div className="flex flex-wrap relative ">
                    <div className="relative">
                      <X
                        size={20}
                        onClick={() => {
                          setEditProductImages((prev) =>
                            prev.filter((img) => img?._id !== prod?._id)
                          );
                          setRemoveProductImages((prev) => [...prev, prod._id]);
                        }}
                        className="absolute cursor-pointer rounded-full p-1 text-white bg-red-600 top-2 right-2"
                      />
                      <img
                        src={prod.file}
                        alt="img"
                        className="w-28 h-28 object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loadingCreateProduct}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 flex items-center gap-2"
                  disabled={loadingCreateProduct || loadingProductActions}
                >
                  {loadingCreateProduct ? (
                    <div className="flex items-center justify-center py-12 gap-2">
                      <Loader2 className="animate-spin text-white" />
                      <span className="text-white">Creating...</span>
                    </div>
                  ) : loadingProductActions ? (
                    <div className="flex items-center justify-center py-12 gap-2">
                      <Loader2 className="animate-spin text-white" />
                      <span className="text-white">Updating...</span>
                    </div>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </div>
            </form>
          </Modal>

          {/* View Product Modal */}
          <Modal
            isOpen={showViewProductModal}
            onClose={() => setShowViewProductModal(false)}
            title={
              viewingProduct?.productName
                ? viewingProduct?.productName
                : "Product Details"
            }
            size="xl"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div>
                <ImagesGallery images={viewingProduct?.images} />
              </div>

              {/* Right Column - Product Details */}
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {viewingProduct?.productName}
                      </h1>
                      {/* <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      {viewingProduct?.subtitle}
                    </p> */}
                    </div>
                    {/* <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      viewingProduct?.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {viewingProduct?.isActive ? "Active" : "Inactive"}
                  </div> */}
                  </div>

                  {/* <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(viewingProduct?.price)}
                  </span>
                  {viewingProduct?.isFeatured && (
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="ml-1 text-sm font-medium">Featured</span>
                    </div>
                  )}
                </div> */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Price:{" "}
                      <span className="text-black dark:text-white">
                        {formatCurrency(viewingProduct?.price)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {viewingProduct?.description}
                  </p>

                  {viewingProduct?.details && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Specifications
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                        {Object.entries(viewingProduct.details)
                          .filter(([key]) => key !== "productId" && key !== "__v" && key !== "_id") 
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="font-semibold">
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                                :
                              </span>{" "}
                              {value}
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Product Details Grid */}
                {/* <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Category
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {viewingProduct?.category?.name}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Stock
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {viewingProduct?.stock} units
                  </p>
                </div>
              </div> */}

                {/* Colors */}
                {viewingProduct?.colors && viewingProduct.colors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Available Colors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.colors.map((color, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100/20 text-primary-600 rounded-full text-sm font-medium"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {viewingProduct?.sizes && viewingProduct.sizes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Available Sizes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.sizes.map((size, index) => (
                        <Badge key={index} variant="default">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Receiving Options */}
                {viewingProduct?.receivingOptions &&
                  viewingProduct.receivingOptions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Receiving Options
                      </h3>
                      <div className="flex gap-3">
                        {viewingProduct.receivingOptions.map(
                          (option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg"
                            >
                              {option === "delivery" ? (
                                <Truck className="w-4 h-4 text-primary-500" />
                              ) : (
                                <MapPin className="w-4 h-4 text-secondary-500" />
                              )}
                              <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                                {option}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Metadata */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDate(viewingProduct?.createdAt)}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {formatDate(viewingProduct?.updatedAt)}
                  </p>
                  <p>
                    <strong>Product ID:</strong> {viewingProduct?._id}
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default Products;
