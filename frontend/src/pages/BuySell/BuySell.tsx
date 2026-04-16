
// export default BuySell;

import React, { useState, useMemo, useEffect } from "react";
import "./BuySell.css";
import Footer from "../../components/Footer";
import { useHistory } from "react-router-dom";

interface EquipmentItem {
  id?: number;
  _id?: string;
  name: string;
  category: "tractor" | "harvester" | "sprayer" | "implement" | "irrigation" | "other";
  price: string;
  quality: "Excellent" | "Good" | "Fair";
  desc: string;
  location: string;
  time: string;
  sold: boolean;
  icon: string;
  seller: string;
  phone: string;
}

const BuySell: React.FC = () => {
  const history = useHistory(); 

  const [filter, setFilter] = useState<"all" | "sold">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    seller: "",
    name: "",
    category: "tractor",
    price: "",
    quality: "Good",
    desc: "",
    location: "",
    phone: ""
  });

  // FETCH ITEMS FROM DB
  useEffect(() => {

    fetch("http://localhost:5000/api/equipment")
      .then(res => res.json())
      .then(data => {

        if (!Array.isArray(data)) {
          console.error("Invalid API response:", data);
          return;
        }

        const formatted = data.map((item: any) => ({
          _id: item._id,
          name: item.name,
          category: item.category,
          price: item.price,
          quality: item.quality,
          desc: item.desc,
          location: item.location,
          time: "Recently Added",
          sold: item.sold ?? false,
          icon: item.icon ?? "📦",
          seller: item.seller,
          phone: item.phone
        }));

        setItems(formatted);

      })
      .catch(err => console.log(err));

  }, []);

  const categories = [
    { id: "all", name: "All", icon: "📦" },
    { id: "tractor", name: "Tractors", icon: "🚜" },
    { id: "harvester", name: "Harvesters", icon: "🌾" },
    { id: "sprayer", name: "Sprayers", icon: "💧" },
    { id: "implement", name: "Implements", icon: "🔧" },
    { id: "irrigation", name: "Irrigation", icon: "💦" },
    { id: "other", name: "Other", icon: "📋" }
  ];

  // ALL HARDCODED ITEMS (UNCHANGED)
  const hardcodedItems: EquipmentItem[] = [
    {
      id: 1,
      name: "Mahindra 575 DI Tractor",
      category: "tractor",
      price: "₹4,50,000",
      quality: "Excellent",
      desc: "2020 model, well maintained, 2500 hours of use",
      location: "Pune, Maharashtra",
      time: "2 days ago",
      sold: false,
      icon: "🚜",
      seller: "Ramesh Patil",
      phone: "+91 98765 43210"
    },
    {
      id: 2,
      name: "John Deere Rotavator",
      category: "implement",
      price: "₹85,000",
      quality: "Good",
      desc: "Used for 3 years, blades replaced last season",
      location: "Nashik, Maharashtra",
      time: "5 days ago",
      sold: false,
      icon: "🔧",
      seller: "Suresh Kumar",
      phone: "+91 98765 43211"
    },
    {
      id: 3,
      name: "Battery Sprayer 16L",
      category: "sprayer",
      price: "₹8,500",
      quality: "Good",
      desc: "Battery operated, 16L capacity",
      location: "Ahmednagar, Maharashtra",
      time: "1 week ago",
      sold: true,
      icon: "💧",
      seller: "Vijay Singh",
      phone: "+91 98765 43212"
    },
    {
      id: 4,
      name: "Combine Harvester",
      category: "harvester",
      price: "₹12,00,000",
      quality: "Excellent",
      desc: "New Holland CR series",
      location: "Sangli, Maharashtra",
      time: "3 days ago",
      sold: false,
      icon: "🌾",
      seller: "Prakash Deshmukh",
      phone: "+91 98765 43213"
    },
    {
      id: 5,
      name: "Drip Irrigation Kit",
      category: "irrigation",
      price: "₹45,000",
      quality: "Excellent",
      desc: "Complete kit for 2 acres",
      location: "Satara, Maharashtra",
      time: "4 days ago",
      sold: false,
      icon: "💦",
      seller: "Anil Jadhav",
      phone: "+91 98765 43214"
    },
    {
      id: 6,
      name: "Swaraj 744 FE Tractor",
      category: "tractor",
      price: "₹5,75,000",
      quality: "Good",
      desc: "2019 model, good condition",
      location: "Kolhapur, Maharashtra",
      time: "1 week ago",
      sold: false,
      icon: "🚜",
      seller: "Ganesh Bhosale",
      phone: "+91 98765 43215"
    },
    {
      id: 7,
      name: "Disc Harrow",
      category: "implement",
      price: "₹65,000",
      quality: "Fair",
      desc: "20 disc harrow, used for 5 years",
      location: "Solapur, Maharashtra",
      time: "2 weeks ago",
      sold: true,
      icon: "🔧",
      seller: "Manoj Kale",
      phone: "+91 98765 43216"
    },
    {
      id: 8,
      name: "Power Weeder",
      category: "other",
      price: "₹18,500",
      quality: "Good",
      desc: "Petrol engine 2.5 HP",
      location: "Pune, Maharashtra",
      time: "6 days ago",
      sold: false,
      icon: "📋",
      seller: "Santosh Pawar",
      phone: "+91 98765 43217"
    },
    {
      id: 9,
      name: "Wheat Thresher",
      category: "harvester",
      price: "₹1,25,000",
      quality: "Excellent",
      desc: "Electric motor, high capacity",
      location: "Ahmednagar, Maharashtra",
      time: "1 day ago",
      sold: false,
      icon: "🌾",
      seller: "Rajesh Shinde",
      phone: "+91 98765 43218"
    },
    {
      id: 10,
      name: "Boom Sprayer",
      category: "sprayer",
      price: "₹2,50,000",
      quality: "Excellent",
      desc: "Tractor mounted, 400L tank",
      location: "Nashik, Maharashtra",
      time: "3 days ago",
      sold: false,
      icon: "💧",
      seller: "Deepak Kulkarni",
      phone: "+91 98765 43219"
    },
    {
      id: 11,
      name: "Cultivator 9 Tine",
      category: "implement",
      price: "₹28,000",
      quality: "Good",
      desc: "Hydraulic cultivator",
      location: "Satara, Maharashtra",
      time: "1 week ago",
      sold: true,
      icon: "🔧",
      seller: "Ashok More",
      phone: "+91 98765 43220"
    },
    {
      id: 12,
      name: "Submersible Pump 5HP",
      category: "irrigation",
      price: "₹32,000",
      quality: "Fair",
      desc: "5 HP pump working condition",
      location: "Kolhapur, Maharashtra",
      time: "5 days ago",
      sold: false,
      icon: "💦",
      seller: "Sampat Nikam",
      phone: "+91 98765 43221"
    }
  ];

  const allItems = [...hardcodedItems, ...items];

  const filteredItems = useMemo(() => {

    let filtered = allItems;

    if (filter === "sold") filtered = filtered.filter(i => i.sold);
    else filtered = filtered.filter(i => !i.sold);

    if (selectedCategory !== "all")
      filtered = filtered.filter(i => i.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.seller.toLowerCase().includes(q)
      );
    }

    return filtered;

  }, [filter, selectedCategory, searchQuery, items]);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSellEquipment = async () => {
    // ✅ VALIDATION ADDED
    if (
      !formData.seller.trim() ||
      !formData.name.trim() ||
      !formData.price.trim() ||
      !formData.desc.trim() ||
      !formData.location.trim() ||
      !formData.phone.trim()
    ) {
      alert("Please fill all fields before posting equipment.");
      return;
    }

    const equipmentData = {
      ...formData,
      icon: "📦",
      sold: false
    };

    const res = await fetch("http://localhost:5000/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(equipmentData)
    });

    const data = await res.json();

    setItems(prev => [...prev, data.equipment]);

    setShowModal(false);

    setFormData({
      seller: "",
      name: "",
      category: "tractor",
      price: "",
      quality: "Good",
      desc: "",
      location: "",
      phone: ""
    });
  };

  return (
    <div className="buy-sell-container">

      <header className="buy-sell-header">
        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => history.goBack()}>
          ← 
        </button>
        <h1>Buy & Sell Equipment</h1>
      </header>

      <main className="buy-sell-content">

        <button className="sell-btn" onClick={() => setShowModal(true)}>
          + Sell Your Equipment
        </button>

        {/* SEARCH */}
        <div className="search-section">
          <div className="search-bar">

            <span className="search-icon">🔍</span>

            <input
              type="text"
              className="search-input"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}

          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="category-chips">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-chip ${selectedCategory === category.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* AVAILABLE / SOLD FILTER */}
        <div className="filter-row">
          <button
            className={`filter ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Available ({allItems.filter(i => !i.sold).length})
          </button>
          <button
            className={`filter ${filter === "sold" ? "active sold" : ""}`}
            onClick={() => setFilter("sold")}
          >
            Sold ({allItems.filter(i => i.sold).length})
          </button>
        </div>


        {/* EQUIPMENT LIST */}
        <div className="equipment-list">

          {filteredItems.map(item => (

            <div key={item._id || item.id} className={`equipment-card ${item.sold ? "sold-item" : ""}`}>

              <div className="card-header">
                <div className="icon">{item.icon}</div>
                {item.sold && <div className="sold-badge">SOLD</div>}
              </div>

              <h3 className="equipment-name">{item.name}</h3>

              <div className="price-quality">
                <span className="price">{item.price}</span>
                <span className={`quality quality-${item.quality.toLowerCase()}`}>
                  {item.quality}
                </span>
              </div>

              <p className="desc">{item.desc}</p>

              <div className="seller-info">👤 {item.seller}</div>

              <div className="meta">
                📍 {item.location}
                <br/>
                ⏱ {item.time}
              </div>

              {!item.sold && (
                <button
                  className="contact-btn"
                  onClick={() => alert(`Contact ${item.seller}\nPhone: ${item.phone}`)}
                >
                  📞 Contact Seller
                </button>
              )}

            </div>

          ))}

        </div>

        {/* SELL MODAL */}
        {showModal && (
          <div className="sell-modal-overlay">

            <div className="sell-modal">

              <h2>Sell Equipment</h2>

              <input
                type="text"
                name="seller"
                placeholder="Seller Name"
                value={formData.seller}
                onChange={handleInputChange}
              />

              <input
                type="text"
                name="name"
                placeholder="Equipment Name"
                value={formData.name}
                onChange={handleInputChange}
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="tractor">Tractor</option>
                <option value="harvester">Harvester</option>
                <option value="sprayer">Sprayer</option>
                <option value="implement">Implement</option>
                <option value="irrigation">Irrigation</option>
                <option value="other">Other</option>
              </select>

              <input
                type="text"
                name="price"
                placeholder="Price (₹)"
                value={formData.price}
                onChange={handleInputChange}
              />

              <select
                name="quality"
                value={formData.quality}
                onChange={handleInputChange}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>

              <textarea
                name="desc"
                placeholder="Description"
                value={formData.desc}
                onChange={handleInputChange}
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
              />

              <div className="modal-buttons">

                <button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="post-btn"
                  onClick={handleSellEquipment}
                >
                  Post Equipment
                </button>

              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />

    </div>
  );
};

export default BuySell;