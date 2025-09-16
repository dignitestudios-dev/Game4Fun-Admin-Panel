import { useState } from "react";
import { handleError, handleSuccess } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCheckoutActions = () => {
  const [loading, setLoading] = useState(false);

  const updateCheckoutStatus = async ( id,status) => {
    setLoading(true);
    try {
      const response = await api.updateCheckoutStatus(id,status);
      setLoading(false);
      handleSuccess(response.message, "Order updated successfully");
      return response
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };
 

  const getOrderById = async (id) => {
    setLoading(true);
    try {
      return await api.getOrderById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateCheckoutStatus , getOrderById };
};

export default useCheckoutActions;
