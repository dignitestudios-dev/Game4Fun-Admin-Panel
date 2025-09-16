import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  MessageSquare,
  Bell,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  CheckCircle,
  Loader,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS, API_CONFIG } from "../config/constants";
import { useApp } from "../contexts/AppContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatsCard from "../components/common/StatsCard";
import UseGetAllKpi from "../hooks/kpi/useGetAllKpi";

const Dashboard = () => {
  const { addNotification } = useApp();
  const { loading, getAllKpi, kpi } = UseGetAllKpi();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Build stats from API response
  const mainStats = [
    {
      title: "Total Users",
      value: kpi ? formatNumber(kpi.countUsers) : "--",
      change: "+12.5%", // replace with real % change if needed
      trend: "up",
      icon: Users,
    },
    {
      title: "Products",
      value: kpi ? formatNumber(kpi.countProducts) : "--",
      change: "+3.1%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Active Orders",
      value: kpi ? formatNumber(kpi.countActiveOrders) : "--",
      change: "+2.5%",
      trend: "up",
      icon: Activity,
    },
    {
      title: "Delivered Orders",
      value: kpi ? formatNumber(kpi.countDeliveredOrders) : "--",
      change: "+1.8%",
      trend: "up",
      icon: CheckCircle,
    },
  ];

  const secondaryStats = [
    {
      title: "Total Revenue",
      value: kpi ? formatCurrency(kpi.totalRevenue) : "--",
      change: "+22.4%",
      trend: "up",
      icon: DollarSign,
    },
  ];

  if(loading) return <Loader/>

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.trend === "up" ? "positive" : "negative"}
            icon={stat.icon ? <stat.icon /> : null}
            index={index}
          />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.trend === "up" ? "positive" : "negative"}
            icon={stat.icon ? <stat.icon /> : null}
            index={index + 10}
          />
        ))}
      </div>

      {/* (Keep your charts, recent activities, etc. as is) */}
    </div>
  );
};

export default Dashboard;
