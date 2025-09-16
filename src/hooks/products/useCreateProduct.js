import { useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCreateProduct = () => {
  const [loading, setLoading] = useState(false);

  const createProduct = async (productData) => {
    setLoading(true);
    try {
      const response = await api.createProduct(productData);
      setLoading(false);
      return response;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };
  const createGame = async (gameData) => {
    setLoading(true);
    try {
      const response = await api.createGame(gameData);
      setLoading(false);
      return response;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  return { loading, createProduct , createGame };
};

export default useCreateProduct;
