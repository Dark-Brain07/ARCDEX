import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import MobileNav from './components/Layout/MobileNav';
import Home from './pages/Home';
import Swap from './pages/DEX/Swap';
import CreateToken from './pages/DEX/CreateToken';
import Liquidity from './pages/DEX/Liquidity';
import NFTExplore from './pages/NFT/Explore';
import NFTCollection from './pages/NFT/Collection';
import NFTDetail from './pages/NFT/NFTDetail';
import CreateCollection from './pages/NFT/CreateCollection';
import Profile from './pages/NFT/Profile';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* DEX Routes */}
          <Route path="/swap" element={<Swap />} />
          <Route path="/create-token" element={<CreateToken />} />
          <Route path="/liquidity" element={<Liquidity />} />
          {/* NFT Routes */}
          <Route path="/nft" element={<NFTExplore />} />
          <Route path="/nft/collection/:address" element={<NFTCollection />} />
          <Route path="/nft/:address/:tokenId" element={<NFTDetail />} />
          <Route path="/nft/create" element={<CreateCollection />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:address" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default App;

