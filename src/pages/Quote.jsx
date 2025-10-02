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
// import usegetAllQuote from "../hooks/products/usegetAllQuote";
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
import usegetAllQuote from "../hooks/faq/useGetAllFaq";
import useCreateFaq from "../hooks/faq/useCreateFaq";
import useGetAllQuote from "../hooks/quote/useGetAllQuote";

const Quote = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);

  // Product hooks
  const { loading, quotes, getAllQuote } = useGetAllQuote(
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
  const [viewQuote, setViewQuote] = useState(null);

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
      key: "fullName",
      label: "Full Name",
      render: (val) => val,
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
    setViewQuote(faq);
    setShowViewFaqModal(true);
  };

  const handleDelete = async (faqId) => {
    console.log(faqId);
    const success = await deleteProduct(faqId);
    if (success) {
      getAllQuote();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

const handleQuoteExport = (data) => {
  return data.map((quote) => ({
    "Full Name": quote.fullName || "",
    "Email Address": quote.emailAddress || "",
    "Min Budget": formatCurrency(quote.minBudgetRange),
    "Max Budget": formatCurrency(quote.maxBudgetRange),
    "Preferred CPU": quote.preferredCPUBrand || "",
    "Preferred GPU": quote.preferredGPUBrand || "",
    RAM: quote.ram || "",
    Storage: quote.storage || "",
    "Additional Feature": quote.additionalFeature || "",
    Created: formatDate(quote.createdAt),
    Updated: formatDate(quote.updatedAt),
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
      getAllQuote()
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
          title="Quote Management"
          loading={loading}
          data={quotes}
          columns={columns}
          onExport={handleQuoteExport}
        //   onAdd={handleAdd}
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
  title="Quote Details"
  size="lg"
>
  <div className="space-y-6">
    {/* Header */}
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {viewQuote?.fullName || "N/A"}
      </h1>
      <p className="text-sm text-gray-500">
        {viewQuote?.emailAddress || "N/A"}
      </p>
    </div>

    {/* Quote Info Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
      <div>
        <span className="font-semibold">Min Budget:</span>{" "}
        {viewQuote?.minBudgetRange !== undefined
          ? formatCurrency(viewQuote.minBudgetRange)
          : "N/A"}
      </div>
      <div>
        <span className="font-semibold">Max Budget:</span>{" "}
        {viewQuote?.maxBudgetRange !== undefined
          ? formatCurrency(viewQuote.maxBudgetRange)
          : "N/A"}
      </div>
      <div>
        <span className="font-semibold">CPU:</span>{" "}
        {viewQuote?.preferredCPUBrand || "N/A"}
      </div>
      <div>
        <span className="font-semibold">GPU:</span>{" "}
        {viewQuote?.preferredGPUBrand || "N/A"}
      </div>
      <div>
        <span className="font-semibold">RAM:</span> {viewQuote?.ram || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Storage:</span>{" "}
        {viewQuote?.storage || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Motherboard:</span>{" "}
        {viewQuote?.motherboard || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Cooling:</span>{" "}
        {viewQuote?.cooling || "N/A"}
      </div>
      <div>
        <span className="font-semibold">PSU:</span> {viewQuote?.psu || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Case Size:</span>{" "}
        {viewQuote?.caseSize || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Case Color:</span>{" "}
        {viewQuote?.caseColor || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Case Style:</span>{" "}
        {viewQuote?.caseStyle || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Monitor Resolution:</span>{" "}
        {viewQuote?.monitorResolution || "N/A"}
      </div>
      <div className="sm:col-span-2">
        <span className="font-semibold">Games:</span>{" "}
        {viewQuote?.games
          ? viewQuote.games.split(",").map((game, idx) => (
              <span key={idx} className="inline-block bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-xs mr-2 mb-2">
                {game.trim()}
              </span>
            ))
          : "N/A"}
      </div>
      <div className="sm:col-span-2">
        <span className="font-semibold">Desired Graphics Setting & FPS:</span>{" "}
        {viewQuote?.graphicsSetting || "N/A"}
      </div>
      <div className="sm:col-span-2">
        <span className="font-semibold">Additional Feature:</span>{" "}
        {viewQuote?.additionalFeature || "N/A"}
      </div>
    </div>

    {/* Metadata */}
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
      <p>
        <strong>Created:</strong>{" "}
        {viewQuote?.createdAt ? formatDate(viewQuote.createdAt) : "N/A"}
      </p>
      <p>
        <strong>Last Updated:</strong>{" "}
        {viewQuote?.updatedAt ? formatDate(viewQuote.updatedAt) : "N/A"}
      </p>
    </div>
  </div>
</Modal>


      </div>
    </div>
  );
};

export default Quote;
