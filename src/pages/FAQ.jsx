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
import { useForm, Controller } from "react-hook-form";
import { formatCurrency, formatDate, formatNumber } from "../utils/helpers";
import Card from "../components/ui/Card";
// import usegetAllFaqs from "../hooks/products/usegetAllFaqs";
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";
import FilterBar from "../components/ui/FilterBar";
import useDebounce from "../hooks/global/useDebounce";
import useGetAllCategories from "../hooks/categories/useGetAllCategories";
import TagInput from "../components/ui/TagInput";
import useProductActions from "../hooks/products/useProductActions";
// import useCreateFaq from "../hooks/products/useCreateFaq";
import ImageUploader from "../components/ui/ImageUploader";
import ImagesGallery from "../components/ui/ImagesGallery";
import StatsCard from "../components/common/StatsCard";
import toast from "react-hot-toast";
import useGetAllFaqs from "../hooks/faq/useGetAllFaq";
import useCreateFaq from "../hooks/faq/useCreateFaq";

const FAQ = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);

  // Product hooks
  const { loading, faqs, getAllFaqs } = useGetAllFaqs(
    searchDebounce,
    status,
    currentPage,
    pageSize
  );
  const { loading: loadingcreateFaq, createFaq } = useCreateFaq();
  // const {
  //   loading: ,
  //   updateProduct,
  //   deleteProduct,
  // } = useProductActions();
  // const { loading: loadingCategories, categories } = useGetAllCategories(
  //   "active",
  //   1,
  //   200
  // );

  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const [showViewFaqModal, setShowViewFaqModal] = useState(false);
  const [viewingFaq, setViewingFaq] = useState(null);

  const defaultValues = {
    question: "",
    answer: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues });

  //   const productStats = useMemo(
  //     () => [
  //       {
  //         title: "Total Products",
  //         value: formatNumber(stats?.totalProducts || 0),
  //         icon: Package,
  //         color: "text-primary-600",
  //         bgColor: "bg-primary-600/20",
  //       },
  //       {
  //         title: "Active Products",
  //         value: formatNumber(stats?.totalActiveProducts || 0),
  //         icon: ShieldCheck,
  //         color: "text-green-600",
  //         bgColor: "bg-green-600/20",
  //       },
  //       {
  //         title: "Inactive Products",
  //         value: formatNumber(stats?.totalInactiveProducts || 0),
  //         icon: ShieldX,
  //         color: "text-orange-600",
  //         bgColor: "bg-orange-600/20",
  //       },
  //     ],
  //     [stats]
  //   );

  const columns = [
    {
      key: "_id",
      label: "ID",
    },
   
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
            disabled={loadingcreateFaq}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      ),
    },
  ];

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
    setEditingFaq(null);
    reset(defaultValues);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    const receivingOptions =
      product?.receivingOptions == ["delivery"]
        ? "delivery"
        : product?.receivingOptions == ["pickup"]
        ? "pickup"
        : "both";

    const formattedProduct = {
      ...product,
      receivingOptions: receivingOptions,
      // category: product.category._id,
      isActive: JSON.stringify(product.isActive), // Convert boolean to string
    };

    console.log("editing formattedProduct: ", formattedProduct);

    setEditingFaq(formattedProduct);

    reset(formattedProduct);
    setShowModal(true);
  };

  const handleView = (faq) => {
    setViewingFaq(faq);
    setShowViewFaqModal(true);
  };

  const handleDelete = async (faqId) => {
    console.log(faqId);
    const success = await deleteProduct(faqId);
    if (success) {
      getAllFaqs();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const handleProductExport = (data) => {
    // Transform data to match your table display
    return data.map((product) => ({
      ID: product._id || "",
      "Product Name": product.title || "",
      Category: product.category?.name || "",
      Price: formatCurrency(product.price),
      "Shipping Cost": formatCurrency(product.shippingCost),
      Stock: product.stock ? formatNumber(product.stock) : "N/A",
      Sizes: product.sizes?.join(", ") || "",
      Colors: product.colors?.join(", ") || "",
      Status: product.isActive ? "Active" : "Inactive",
      Created: formatDate(product.createdAt),
    }));
  };

  const onSubmit = async (data) => {
    try {
      let success;
      if (editingFaq) {
        success = await updateFaq(editingFaq.id, data);
        if (success) {
          toast.success("FAQ updated successfully");
        }
      } else {
        success = await createFaq(data);
      
        if (success) {
          toast.success("FAQ created successfully");
        }
      }

      reset(defaultValues);
      getAllFaqs()
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
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
          title="FAQ Management"
          loading={loading}
          data={faqs}
          columns={columns}
          onExport={handleProductExport}
          onAdd={handleAdd}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          //   totalPages={totalPages}
          //   totalData={totalData}
          searchTerm={search}
          onSearch={(value) => handleSearch(value)}
          //   searchable
          exportable
        />

        {/* Create/Edit Product Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title={editingFaq ? "Edit FAQ" : "Add New FAQ"}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Question */}
            <Input
              label="Question"
              {...register("question", { required: "Question is required" })}
              disabled={loadingcreateFaq}
              error={errors.question?.message}
              placeholder="Enter your question"
            />

            {/* Answer */}
            <TextArea
              label="Answer"
              {...register("answer", { required: "Answer is required" })}
              rows={4}
              placeholder="Enter the answer"
              error={errors.answer?.message}
              disabled={loadingcreateFaq}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loadingcreateFaq}
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 flex items-center gap-2"
                disabled={loadingcreateFaq}
              >
                {loadingcreateFaq ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className="animate-spin text-white" />
                    <span className="text-white">Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 gap-2">
                    {/* <Loader2 className="animate-spin text-white" /> */}
                    <span className="text-white">Create</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Product Modal */}
        <Modal
          isOpen={showViewFaqModal}
          onClose={() => setShowViewFaqModal(false)}
          title={
            viewingFaq?.productName
              ? viewingFaq?.productName
              : "Product Details"
          }
          size="xl"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div>
              <ImagesGallery images={viewingFaq?.images} />
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viewingFaq?.productName}
                    </h1>
                    {/* <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      {viewingFaq?.subtitle}
                    </p> */}
                  </div>
                  {/* <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      viewingFaq?.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {viewingFaq?.isActive ? "Active" : "Inactive"}
                  </div> */}
                </div>

                {/* <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(viewingFaq?.price)}
                  </span>
                  {viewingFaq?.isFeatured && (
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
                      {formatCurrency(viewingFaq?.price)}
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
                  {viewingFaq?.description}
                </p>

                {viewingFaq?.details && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                      {Object.entries(viewingFaq.details)
                        .filter(([key]) => key !== "_id" && key !== "__v") // 🔹 filter out unwanted fields
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
                    {viewingFaq?.category?.name}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Stock
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {viewingFaq?.stock} units
                  </p>
                </div>
              </div> */}

              {/* Colors */}
              {viewingFaq?.colors && viewingFaq.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Available Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingFaq.colors.map((color, index) => (
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
              {viewingFaq?.sizes && viewingFaq.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Available Sizes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingFaq.sizes.map((size, index) => (
                      <Badge key={index} variant="default">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Receiving Options */}
              {viewingFaq?.receivingOptions &&
                viewingFaq.receivingOptions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Receiving Options
                    </h3>
                    <div className="flex gap-3">
                      {viewingFaq.receivingOptions.map((option, index) => (
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
                      ))}
                    </div>
                  </div>
                )}

              {/* Metadata */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Created:</strong> {formatDate(viewingFaq?.createdAt)}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {formatDate(viewingFaq?.updatedAt)}
                </p>
                <p>
                  <strong>Product ID:</strong> {viewingFaq?._id}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FAQ;
