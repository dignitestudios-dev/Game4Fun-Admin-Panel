import { useMemo, useState } from "react";
import { Trash2, Eye, Loader2, Check, X } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";

import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import { useForm, Controller } from "react-hook-form";
import { formatCurrency, formatDate, formatNumber } from "../utils/helpers";

import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";

import useDebounce from "../hooks/global/useDebounce";

import toast from "react-hot-toast";
import useGetAllFaqs from "../hooks/faq/useGetAllFaq";
import useCreateFaq from "../hooks/faq/useCreateFaq";
import useFaqActions from "../hooks/faq/useFaqActions";
import useGetAllReviews from "../hooks/reviews/useGetAllReviews";
import useReviewActions from "../hooks/reviews/useReviewActions";

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);

  // Product hooks
  const { loading, reviews, getAllReviews, totalPages } = useGetAllReviews(
    searchDebounce,
    status,
    currentPage,
    pageSize
  );
  //   const { loading: loadingcreateFaq, createFaq } = useCreateFaq();
  const {
    loading: ReviewLoader,
    updateStatus,
    deleteReview,
  } = useReviewActions();

  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const [showViewReviewModal, setShowViewReviewModal] = useState(false);
  const [viewingReview, setViewingReview] = useState(null);
  const handleUpdateStatus = async (reviewId, status) => {
    try {
      const res = await updateStatus(reviewId, status);
      getAllReviews();
      // Show success message (optional)
      console.log(res.message || `Review ${newStatus} successfully`);

      // toast.success(`Review ${newStatus} successfully`);
    } catch (error) {
      console.error("Failed to update review status:", error);
    }
  };
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
  key: "picture",
  label: "Picture",
  render: (value) => (
    value ? (
      <img
        src={value}
        alt="Review"
        className="w-12 h-12 object-cover rounded"
      />
    ) : (
      <span className="text-gray-400 text-sm">N/A</span>
    )
  ),
},
    {
      key: "title",
      label: "Title",
    },
    {
      key: "rating",
      label: "Rating",
      render: (value) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < value ? "text-yellow-400" : "text-gray-400"}
            >
              ★
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "review",
      label: "Review",
      render: (value) => <span className="line-clamp-2 max-w-xs">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value === "pending"
              ? "bg-yellow-500/20 text-yellow-500"
              : value === "approved"
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
    // Uncomment if you need actions
    {
      key: "actions",
      label: "Actions",
      render: (_, review) => (
        <div className="flex items-center space-x-2">
          {review.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus(review._id, "accepted")}
           disabled={ReviewLoader}
                className="text-green-500 hover:text-green-600"
                icon={<Check className="w-4 h-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus(review._id, "rejected")}
               disabled={ReviewLoader}
                className="text-red-500 hover:text-red-600"
                icon={<X className="w-4 h-4" />}
              />
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(review)}
            icon={<Eye className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(review._id)}
              disabled={ReviewLoader}
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
    setViewingReview(faq);
    setShowViewReviewModal(true);
  };

  const handleDelete = async (id) => {
    await deleteReview(id);
    getAllReviews()
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
      getAllFaqs();
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
          title="Reviews Management"
          loading={loading}
          data={reviews}
          columns={columns}
          //   onExport={handleProductExport}
          //   onAdd={handleAdd}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          //   totalData={totalData}

          searchTerm={search}
          onSearch={(value) => handleSearch(value)}
          //   searchable
          //   exportable
        />

        <Modal
          isOpen={showViewReviewModal}
          onClose={() => setShowViewReviewModal(false)}
          title="Review Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Picture */}
            {viewingReview?.picture && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <img
                  src={viewingReview.picture}
                  alt="Review"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Title & Rating */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {viewingReview?.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < viewingReview?.rating
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-semibold">
                  {viewingReview?.rating}/5
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Review
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {viewingReview?.review}
              </p>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Status
              </h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  viewingReview?.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : viewingReview?.status === "approved"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {viewingReview?.status}
              </span>
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>
                <strong>Created:</strong> {formatDate(viewingReview?.createdAt)}
              </p>
              <p>
                <strong>Review ID:</strong> {viewingReview?._id}
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Reviews;
