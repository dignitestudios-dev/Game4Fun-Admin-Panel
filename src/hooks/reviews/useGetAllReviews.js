import React, { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetAllReviews = (search, status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
 const [totalPages, setTotalPages] = useState(1);
  const getAllReviews = async () => {
    setLoading(true);

    try {
      const response = await api.getAllReviews(page, limit);
      setReviews(response.data);
      setTotalPages(response.totalPages)
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllReviews();
  }, [page, limit, search, status]);

  return { loading, reviews,  getAllReviews , totalPages };
};

export default useGetAllReviews;
