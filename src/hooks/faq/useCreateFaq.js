import { useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCreateFaq = () => {
  const [loading, setLoading] = useState(false);

  const createFaq = async (productData) => {
    setLoading(true);
    try {
      const response = await api.createFaq(productData);
      setLoading(false);
      return response;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  return { loading, createFaq };
};

export default useCreateFaq;
