// app/statistics/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Container, Box } from "@mui/material";
import {
  Chart,
  Chart as ChartJS,
  
} from "chart.js/auto";
import { db, auth } from "@/utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Addchart } from "@mui/icons-material";

interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
}

const StatisticsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchProducts(currentUser.uid);
      }
    });

    return () => unsubscribe(); 
  }, []);

  const fetchProducts = async (userId: string) => {
    const q = query(collection(db, "products"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const productsList: Product[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, "id">), 
    }));
    setProducts(productsList);
  };

  const renderChart = () => {
    if (!products.length) return;
    const categoryTotals = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      acc[product.category] += product.price * product.quantity;
      return acc;
    }, {} as Record<string, number>);
  
    const categories = Object.keys(categoryTotals);
    const totalValues = categories.map((category) => categoryTotals[category]);
  
    const ctx = document.getElementById("categoryChart") as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx.getContext("2d")!, {
        type: "bar",
        data: {
          labels: categories,
          datasets: [
            {
              label: "Total Value",
              data: totalValues,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Total Value ($)",
              },
            },
          },
        },
      });
    }
  };
  

  useEffect(() => {
    renderChart();
  }, [products]);

  return (
    <Container sx={{ padding: "100px 0px" }}>
      <h1 className="text-4xl flex gap-2 items-center font-bold my-4">
        <Addchart className="w-9 h-9" />
        Statistics
      </h1>
      <Box className="my-8">
        <canvas id="categoryChart" width="400" height="200"></canvas>
      </Box>
    </Container>
  );
};

export default StatisticsPage;
