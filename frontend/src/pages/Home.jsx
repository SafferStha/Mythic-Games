import Navbar from "../components/Navbar";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page home-page--welcome">
      <Navbar />
      <main className="home-welcome-content">
        <h1 className="home-welcome-title">Welcome to Mythic Games Store</h1>
      </main>
    </div>
  );
};

export default Home;
