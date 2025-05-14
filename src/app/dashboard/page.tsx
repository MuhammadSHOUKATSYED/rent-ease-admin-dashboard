'use client'; // Add this line at the top of your file

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Bar, Pie, Line } from "react-chartjs-2";
import { FaChartBar } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";

// Registering necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,  // Use PointElement instead of Point
  LineElement
);

export default function DashboardPage() {
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [donationsData, setDonationsData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [queriesData, setQueriesData] = useState<any[]>([]); // State for queries data

  // Fetch real-time data from Supabase for various sections
  useEffect(() => {
    const fetchReportsData = async () => {
      const { data } = await supabase.from("damage_reports").select("*");
      setReportsData(data || []);
    };

    const fetchUserData = async () => {
      const { data } = await supabase.from("profiles").select("*");
      setUserData(data || []);
    };

    const fetchDonationsData = async () => {
      const { data } = await supabase.from("donations").select("*");
      setDonationsData(data || []);
    };

    const fetchProductsData = async () => {
      const { data } = await supabase.from("product_listings").select("*");
      setProductsData(data || []);
    };

    const fetchQueriesData = async () => { // Fetch queries data
      const { data } = await supabase.from("queries").select("*");
      setQueriesData(data || []);
    };

    fetchReportsData();
    fetchUserData();
    fetchDonationsData();
    fetchProductsData();
    fetchQueriesData(); // Fetch queries data
  }, []);

  // Data for Damage Reports chart (Bar chart: Number of reports by status)
  const reportsStatusData = {
    labels: ["Resolved", "Unresolved"],
    datasets: [
      {
        label: "Damage Reports Status",
        data: [
          reportsData.filter((r) => r.status === "resolved").length,
          reportsData.filter((r) => r.status === "unresolved").length,
        ],
        backgroundColor: ["#4CAF50", "#FF5722"],
      },
    ],
  };

  // Data for Users chart (Pie chart: Active vs Inactive Users)
  const usersStatusData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "User Status",
        data: [
          userData.filter((u) => u.isActive).length,
          userData.filter((u) => !u.isActive).length,
        ],
        backgroundColor: ["#2196F3", "#FFC107"],
      },
    ],
  };

  // Data for Users chart (Pie chart: Verified vs Non-Verified Users)
  const usersVerificationStatusData = {
    labels: ["Verified", "Non-Verified"],
    datasets: [
      {
        label: "User Verification Status",
        data: [
          userData.filter((u) => u.verification === "Yes").length,
          userData.filter((u) => u.verification === "No").length,
        ],
        backgroundColor: ["#4CAF50", "#FF5722"],
      },
    ],
  };

// Data for Donations by Category (Pie Chart)
const donationsByCategoryData = {
  labels: [...new Set(donationsData.map((d) => d.category))],
  datasets: [
    {
      label: "Donations by Category",
      data: [
        ...Array.from(new Set(donationsData.map((d) => d.category)))
          .map((category) =>
            donationsData.filter((d) => d.category === category).length
          ),
      ],
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
      ],
    },
  ],
};

  // Data for Products chart (Bar chart: Products by Category)
  const productsCategoryData = {
    labels: [...new Set(productsData.map((p) => p.category))], // Extract unique categories
    datasets: [
      {
        label: "Products by Category",
        data: [
          ...Array.from(new Set(productsData.map((p) => p.category))) // Convert Set to array before mapping
            .map((category) =>
              productsData.filter((p) => p.category === category).length
            ),
        ],
        backgroundColor: [
          "#FFEB3B", "#FF9800", "#9C27B0", "#673AB7", "#2196F3",
        ],
      },
    ],
  };

  // Data for Queries chart (Pie chart: Open vs Closed Queries)
  const queriesStatusData = {
    labels: ["Resolved", "Unresolved"],
    datasets: [
      {
        label: "Queries Status",
        data: [
          queriesData.filter((q) => q.status === "unresolved").length,
          queriesData.filter((q) => q.status === "resolved").length,
        ],
        backgroundColor: ["#2196F3", "#FF5722"],
      },
    ],
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <FaChartBar size={24} className="mr-2" />
        <h1 className="text-3xl font-semibold text-gray-800">Analytics</h1>
      </div>

      {/* Products by Category Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Products by Category</h2>
        <Bar
          data={productsCategoryData}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: "Products by Category" },
            },
          }}
        />
      </div>

      {/* User Status Chart */}
      <div className="mb-8 p-9" style={{ width: '500px', height: '500px' }}>
        <h2 className="text-xl font-semibold mb-4">User Status</h2>
        <Pie
          data={usersStatusData}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: "Active vs Inactive Users" },
            },
          }}
        />
      </div>

      {/* User Verification Status Chart */}
      <div className="mb-8 p-9" style={{ width: '500px', height: '500px' }}>
        <h2 className="text-xl font-semibold mb-4">User Verification Status</h2>
        <Pie
          data={usersVerificationStatusData}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: "Verified vs Non-Verified Users" },
            },
          }}
        />
      </div>

      {/* Donations by Category Chart */}
      <div className="mb-8 p-9" style={{ width: '500px', height: '500px' }}>
        <h2 className="text-xl font-semibold mb-4">Donations by Category</h2>
        <Pie
          data={donationsByCategoryData}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: "Donations by Category" },
            },
          }}
        />
      </div>

      {/* Damage Reports Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Damage Reports Status</h2>
        <Bar
          data={reportsStatusData}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: "Reports by Status" },
            },
          }}
        />
      </div>
      
      {/* Queries Status Chart */}
      <div className="mb-8 p-9" style={{ width: '500px', height: '500px' }}>
        <h2 className="text-xl font-semibold mb-4">Queries Status</h2>
        <Pie
          data={queriesStatusData}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: "Open vs Closed Queries" },
            },
          }}
        />
      </div>
    </div>
  );
}
