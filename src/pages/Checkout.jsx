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
// import useGetAllCheckout from "../hooks/products/useGetAllCheckout";
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
import useGetAllCheckout from "../hooks/checkout/useGetAllCheckout";
import useCheckoutActions from "../hooks/checkout/useCheckoutActions";

const Checkouts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);

  const [editingOrder, setEditingOrder] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState(
    editingOrder?.status || "active"
  );
  // Product hooks
  const { loading, checkouts, totalPages, totalData, getAllCheckout } =
    useGetAllCheckout(searchDebounce, status, currentPage, pageSize);

  const {
    loading: checkloader,
    getOrderById,
    updateCheckoutStatus,
  } = useCheckoutActions();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const columns = [
    {
      key: "_id",
      label: "Order ID",
    },
    {
      key: "user",
      label: "Customer",
      render: (user) => (
        <div className="flex items-center space-x-2">
          <img
            src={user?.profilePicture}
            alt={user?.fullName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.fullName}
            </p>
            <p className="text-xs text-white">{user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (value) => formatCurrency(value),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <Badge
          variant={
            status === "delivered"
              ? "success"
              : status === "pending"
              ? "warning"
              : "danger"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (_, order) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {order.address}, {order.city}, {order.country} - {order.zipCode}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, order) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(order)}
            icon={<Eye className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(order)}
            icon={<Edit className="w-4 h-4" />}
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


  const handleEdit = async (order) => {
    await getOrderById(order._id);
    setOrderId(order._id);
    setEditingOrder(order);
    setOrderStatus(order.status);

    setShowEditModal(true);
  };

  const handleView = (order) => {
    setViewOrder(order);
    setShowViewOrderModal(true);
  };

  const handleCheckoutExport = (data) => {
    return data.map((order) => ({
      ID: order._id || "",
      "Customer Name": `${order.firstName || ""} ${order.lastName || ""}`,
      Email: order.user?.email || "",
      "Profile Picture": order.user?.profilePicture || "",
      Status: order.status
        ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
        : "N/A",
      Price: formatCurrency(order.price),
      Address: `${order.address || ""}, ${order.city || ""}, ${
        order.country || ""
      }, ${order.zipCode || ""}`,
      "Stripe Customer ID": order.stripeCustomerId || "",
      "Stripe Payment Intent": order.stripePaymentIntentId || "",
      Created: formatDate(order.createdAt),
      Updated: formatDate(order.updatedAt),
    }));
  };

  const handleSubmit = async () => {
    const res = await updateCheckoutStatus(orderId, orderStatus);
    if(res){

      getAllCheckout();
    }
    setShowEditModal(false);
    toast.success(res.data.message);
  };
  return (
    <>
      <div className="space-y-6">
        <div>
          <DataTable
            title="Checkout Management"
            loading={loading}
            data={checkouts}
            columns={columns}
            onExport={handleCheckoutExport}
            // onAdd={handleAdd}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            totalData={totalData}
            // searchTerm={search}
            // onSearch={(value) => handleSearch(value)}
            // searchable
            exportable
          />

        <Modal
  isOpen={showEditModal}
  onClose={() => setShowEditModal(false)}
  title="Update Order Status"
  size="md"
>
  <div className="space-y-6">
    {/* Customer Info (Read-only) */}
    <div className="space-y-2">
      <p className="text-sm text-gray-700 dark:text-white">
        <strong>Customer:</strong> {editingOrder?.firstName}{" "}
        {editingOrder?.lastName}
      </p>
      <p className="text-sm text-gray-700 dark:text-white">
        <strong>Email:</strong> {editingOrder?.user?.email}
      </p>
      <p className="text-sm text-gray-700 dark:text-white">
        <strong>Price:</strong> {formatCurrency(editingOrder?.price)}
      </p>
      <p className="text-sm text-gray-700 dark:text-white">
        <strong>Address:</strong>{" "}
        {`${editingOrder?.address}, ${editingOrder?.city}, ${editingOrder?.country}, ${editingOrder?.zipCode}`}
      </p>
      <p className="text-sm text-gray-700 dark:text-white">
        <strong>Created:</strong> {formatDate(editingOrder?.createdAt)}
      </p>
    </div>

    {/* Editable Field: Status */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        Order Status
      </label>
      <select
        value={orderStatus}
        onChange={(e) => setOrderStatus(e.target.value)}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 px-3 py-2 text-sm 
                   text-gray-900 dark:text-white 
                   focus:border-pink-500 focus:ring-pink-500"
      >
        <option value="active">Active</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>

    {/* Actions */}
    <div className="flex justify-end space-x-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowEditModal(false)}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={handleSubmit}
        className="h-10 flex items-center gap-2"
        disabled={checkloader}
      >
        {checkloader ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin text-white" />
            <span className="text-white">Updating...</span>
          </div>
        ) : (
          "Update Status"
        )}
      </Button>
    </div>
  </div>
</Modal>


          {/* View Product Modal */}
          <Modal
            isOpen={showViewOrderModal}
            onClose={() => setShowViewOrderModal(false)}
            title={`Order Details - ${viewOrder?._id || ""}`}
            size="xl"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Customer Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <img
                    src={viewOrder?.user?.profilePicture}
                    alt={viewOrder?.user?.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {viewOrder?.user?.fullName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {viewOrder?.user?.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {viewOrder?.address}, {viewOrder?.city},{" "}
                    {viewOrder?.country} - {viewOrder?.zipCode}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Payment Info
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Stripe Customer ID:</strong>{" "}
                    {viewOrder?.stripeCustomerId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Payment Intent ID:</strong>{" "}
                    {viewOrder?.stripePaymentIntentId}
                  </p>
                </div>
              </div>

              {/* Right Column - Order Details */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Order Summary
                    </h1>
                    <Badge
                      variant={
                        viewOrder?.status === "delivered"
                          ? "success"
                          : viewOrder?.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {viewOrder?.status?.charAt(0).toUpperCase() +
                        viewOrder?.status?.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    Price:{" "}
                    <span className="text-black dark:text-white">
                      {formatCurrency(viewOrder?.price)}
                    </span>
                  </p>
                </div>

                {/* Metadata */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-white dark:text-gray-400 space-y-1">
                  <p>
                    <strong>Created:</strong> {formatDate(viewOrder?.createdAt)}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {formatDate(viewOrder?.updatedAt)}
                  </p>
                  <p>
                    <strong>Order ID:</strong> {viewOrder?._id}
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

export default Checkouts;
