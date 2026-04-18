import { useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SIMULATOR_URL = "https://simulador.ayresmarketing.com/";

const Simulator = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "GESTOR")) {
      navigate(user ? "/products" : "/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== "GESTOR") return null;

  return (
    <Layout>
      <div className="fixed left-0 md:left-64 right-0 top-14 md:top-0 bottom-0">
        <iframe
          src={SIMULATOR_URL}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Layout>
  );
};

export default Simulator;
