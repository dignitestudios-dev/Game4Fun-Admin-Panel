import { useState } from "react";
import { handleError, handleSuccess } from "../../utils/helpers";
import { api } from "../../lib/services";

const useReviewActions = () => {
  const [loading, setLoading] = useState(false);


  
  const updateStatus = async (id , status) => {
    setLoading(true);
    try {
      const response = await api.updateStatus(id , status);
      setLoading(false);
      handleSuccess(response.message, "Status Updated");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };
  const deleteReview = async (id) => {
    setLoading(true);
    try {
      const response = await api.deleteReview(id);
      setLoading(false);
      handleSuccess(response.message, "Status Deleted");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };
  

  return { loading,  updateStatus , deleteReview };
};

export default useReviewActions;
