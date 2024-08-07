// app/statistics/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Chart } from "chart.js/auto";
import { db, auth } from "@/utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Addchart,
  AttachMoney,
  ShoppingCart,
  TrendingUp,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
}

interface SoldItem {
  price: number;
  id: string;
  productId: string;
  quantity: number;
  name:string
  category: string;
  dateSold: string;
}

const StatisticsPage: React.FC = () => {
  const router=useRouter()
  const [products, setProducts] = useState<Product[]>([]);
  const [soldItems, setSoldItems] = useState<SoldItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalItemsSold, setTotalItemsSold] = useState<number>(0);
  const [highestSellingProduct, setHighestSellingProduct] =
    useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchProducts(currentUser.uid);
        fetchSoldItems(currentUser.uid);
      }else{
        router.push('/login')
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

  const fetchSoldItems = async (userId: string) => {
    const q = query(collection(db, "soldItems"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const soldItemsList: SoldItem[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<SoldItem, "id">),
    }));
    setSoldItems(soldItemsList);
  };

  useEffect(() => {
    if (products?.length && soldItems?.length) {
      calculateStatistics();
    }
  }, [products, soldItems]);

console.log(soldItems)

  const calculateStatistics = () => {
    let totalRevenue = 0;
    let totalItemsSold = 0;
    const productSales: Record<string, number> = {};

    soldItems.forEach((item) => {
      // const product = products.find((product) => product.id === item.productId);
      if (item) {
        totalRevenue += item.quantity * item.price;
        totalItemsSold += item.quantity;
        if (!productSales[item?.name]) {
          productSales[item?.name] = 0;
        }
        productSales[item?.name] += item.quantity;
      }
    });

    const highestSellingProduct = Object.keys(productSales).reduce((a, b) =>
      productSales[a] > productSales[b] ? a : b
    );

    setTotalRevenue(totalRevenue);
    setTotalItemsSold(totalItemsSold);
    setHighestSellingProduct(highestSellingProduct);
  };


  const renderChart = () => {
    if (!soldItems.length) return;
    const categoryTotals = soldItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += item.price * item.quantity;
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
  }, [soldItems]);

  return (
    <Container sx={{ padding: "100px 0px" }}>
      <h1 className="text-4xl flex gap-2 items-center font-bold my-4">
        <Addchart className="w-9 h-9 text-red-500" />
        Statistics
      </h1>
      <Grid container spacing={3} className="my-8">
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney className="mr-4 text-green-500" />
                <Box>
                  <Typography variant="h5">
                    ${totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ShoppingCart className="mr-4 text-blue-500" />
                <Box>
                  <Typography variant="h5">{totalItemsSold}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Items Sold
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp className="mr-4 text-purple-500" />
                <Box>
                  <Typography variant="h5">{highestSellingProduct}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Highest Selling Product
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box className="my-8">
        <canvas id="categoryChart" width="400" height="200"></canvas>
      </Box>
    </Container>
  );
};

export default StatisticsPage;
