import { useState } from "react";
import { handleError, handleSuccess } from "../../utils/helpers";
import { api } from "../../lib/services";

const useFaqActions = () => {
  const [loading, setLoading] = useState(false);


  const deleteFaq = async (id) => {
    setLoading(true);
    try {
      const response = await api.deleteFaq(id);
      setLoading(false);
      handleSuccess(response.message, "Faq deleted successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  

  return { loading,  deleteFaq };
};

export default useFaqActions;
