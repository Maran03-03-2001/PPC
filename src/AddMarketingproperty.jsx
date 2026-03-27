import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { RiLayoutLine } from "react-icons/ri";
import {
  TbArrowLeftRight,
  TbMapPinCode,
  TbWorldLongitude,
} from "react-icons/tb";
import {
  FaBath,
  FaChartArea,
  FaPhone,
  FaEdit,
  FaHome,
  FaUserAlt,
  FaEnvelope,
  FaRupeeSign,
  FaFileVideo,
  FaToilet,
  FaCar,
  FaBed,
  FaCity,
} from "react-icons/fa";
import { FaRegAddressCard } from "react-icons/fa6";
import {
  MdLocationOn,
  MdOutlineMeetingRoom,
  MdOutlineOtherHouses,
  MdSchedule,
  MdStraighten,
  MdApproval,
  MdLocationCity,
  MdAddPhotoAlternate,
  MdOutlineClose,
} from "react-icons/md";
import {
  BsBank,
  BsBuildingsFill,
  BsFillHouseCheckFill,
  BsTextareaT,
} from "react-icons/bs";
import {
  GiKitchenScale,
  GiMoneyStack,
  GiResize,
  GiGears,
} from "react-icons/gi";
import { BiWorld } from "react-icons/bi";
import { HiUserGroup } from "react-icons/hi";
import { BiBuildingHouse } from "react-icons/bi";
import { IoCloseCircle } from "react-icons/io5";
import { toWords } from "number-to-words";
import moment from "moment";
import { useSelector } from "react-redux";
import { FcSearch } from "react-icons/fc";

function AddMarketingProperty({ isPublic = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const inputRef = useRef(null);
  const coordRef = useRef(null);
  const [ppcId, setPpcId] = useState(localStorage.getItem("ppcId") || "");
  const [priceInWords, setPriceInWords] = useState("");

  const [formData, setFormData] = useState({
    propertyMode: "",
    propertyType: "",
    price: "",
    priceData: "",
    propertyAge: "",
    bankLoan: "",
    negotiation: "",
    length: "",
    breadth: "",
    totalArea: "",
    ownership: "",
    bedrooms: "",
    kitchen: "",
    balconies: "",
    floorNo: "",
    areaUnit: "",
    propertyApproved: "",
    postedBy: "",
    facing: "",
    salesMode: "",
    salesType: "",
    description: "",
    furnished: "",
    lift: "",
    attachedBathrooms: "",
    western: "",
    numberOfFloors: "",
    carParking: "",
    country: "",
    state: "",
    city: "",
    district: "",
    area: "",
    streetName: "",
    doorNumber: "",
    nagar: "",
    ownerName: "",
    email: "",
    phoneNumber: "",
    phoneNumberCountryCode: "",
    alternatePhone: "",
    alternatePhoneCountryCode: "",
    bestTimeToCall: "",
    pinCode: "",
    locationCoordinates: "",
  });

  const [photos, setPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [coordinateInput, setCoordinateInput] = useState("");
  const [videos, setVideos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  useEffect(() => {
    if (!window.google) return;

    const interval = setInterval(() => {
      if (mapRef.current && inputRef.current) {
        clearInterval(interval);

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 11.9416, lng: 79.8083 },
          zoom: 10,
        });

        mapInstance.current = map;
        const geocoder = new window.google.maps.Geocoder();
        map.addListener("click", (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          updateMap(lat, lng);

          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
              const place = results[0];

              const getComponent = (type) => {
                const comp = place.address_components?.find((c) =>
                  c.types.includes(type),
                );
                return comp?.long_name || "";
              };

              setFormData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                pinCode: getComponent("postal_code"),
                city: getComponent("sublocality_level_1"),
                area: getComponent("sublocality_level_2"),
                nagar: getComponent("sublocality"),
                streetName: getComponent("route") || getComponent("premise"),
                district:
                  getComponent("administrative_area_level_2") ||
                  getComponent("locality"),
                state: getComponent("administrative_area_level_1"),
                country: getComponent("country"),
                doorNumber: getComponent("street_number"),
                locationCoordinates: `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`,
              }));
            }
          });
        });

        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["geocode"],
          },
        );

        autocomplete.bindTo("bounds", map);

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          updateMap(lat, lng);

          const getComponent = (type) => {
            const comp = place.address_components?.find((c) =>
              c.types.includes(type),
            );
            return comp?.long_name || "";
          };

          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            pinCode: getComponent("postal_code"),
            city:
              getComponent("locality") ||
              getComponent("administrative_area_level_2"),
            area:
              getComponent("sublocality") ||
              getComponent("sublocality_level_1"),
            streetName: getComponent("route") || getComponent("premise"),
            district: getComponent("administrative_area_level_2"),
            state: getComponent("administrative_area_level_1"),
            country: getComponent("country"),
            doorNumber: getComponent("street_number"),
            locationCoordinates: `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`,
          }));
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const updateMap = (lat, lng) => {
    const map = mapInstance.current;
    if (!map) return;

    map.setCenter({ lat, lng });
    map.setZoom(12);

    const position = { lat, lng };
    const geocoder = new window.google.maps.Geocoder();

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position,
        map,
        draggable: true,
      });

      markerRef.current.addListener("dragend", (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();

        geocoder.geocode(
          { location: { lat: newLat, lng: newLng } },
          (results, status) => {
            if (status === "OK" && results[0]) {
              const place = results[0];
              const getComponent = (type) => {
                const comp = place.address_components?.find((c) =>
                  c.types.includes(type),
                );
                return comp?.long_name || "";
              };

              setFormData((prev) => ({
                ...prev,
                latitude: newLat,
                longitude: newLng,
                pinCode: getComponent("postal_code"),
                city: getComponent("sublocality_level_1"),
                area: getComponent("sublocality_level_2"),
                nagar: getComponent("sublocality"),
                streetName: getComponent("route") || getComponent("premise"),
                district:
                  getComponent("administrative_area_level_2") ||
                  getComponent("locality"),
                state: getComponent("administrative_area_level_1"),
                country: getComponent("country"),
                doorNumber: getComponent("street_number"),
                locationCoordinates: `${newLat.toFixed(6)}° N, ${newLng.toFixed(6)}° E`,
              }));
            }
          },
        );
      });
    }
  };

  const handleLatLngAuto = (input) => {
    input = input.trim();

    const matchDecimalDir = input.match(
      /([-\d.]+)[^\dNS]*([NS]),?\s*([-\d.]+)[^\dEW]*([EW])/i,
    );

    let lat, lng;

    if (matchDecimalDir) {
      lat = parseFloat(matchDecimalDir[1]);
      const latDir = matchDecimalDir[2].toUpperCase();
      lng = parseFloat(matchDecimalDir[3]);
      const lngDir = matchDecimalDir[4].toUpperCase();

      if (latDir === "S") lat = -lat;
      if (lngDir === "W") lng = -lng;
    } else {
      const dmsRegex =
        /(\d+)[°:\s](\d+)[\'′:\s](\d+(?:\.\d+)?)[\"\″]?\s*([NS])[^0-9]*(\d+)[°:\s](\d+)[\'′:\s](\d+(?:\.\d+)?)[\"\″]?\s*([EW])/i;
      const dmsMatch = input.match(dmsRegex);

      if (dmsMatch) {
        const [
          ,
          latDeg,
          latMin,
          latSec,
          latDir,
          lngDeg,
          lngMin,
          lngSec,
          lngDir,
        ] = dmsMatch;

        lat = dmsToDecimal(+latDeg, +latMin, +latSec, latDir.toUpperCase());
        lng = dmsToDecimal(+lngDeg, +lngMin, +lngSec, lngDir.toUpperCase());
      } else {
        const plainDecimal = input.match(/([-\d.]+)[,\s]+([-\d.]+)/);
        if (plainDecimal) {
          lat = parseFloat(plainDecimal[1]);
          lng = parseFloat(plainDecimal[2]);
        } else {
          return;
        }
      }
    }

    if (!isNaN(lat) && !isNaN(lng)) {
      updateMap(lat, lng);

      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          const place = results[0];

          const getComponent = (type) => {
            const comp = place.address_components.find((c) =>
              c.types.includes(type),
            );
            return comp?.long_name || "";
          };

          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            pinCode: getComponent("postal_code"),
            city:
              getComponent("locality") ||
              getComponent("administrative_area_level_3"),
            area:
              getComponent("sublocality") ||
              getComponent("sublocality_level_1"),
            streetName: getComponent("route") || getComponent("premise"),
            district: getComponent("administrative_area_level_2"),
            state: getComponent("administrative_area_level_1"),
            country: getComponent("country"),
            doorNumber: getComponent("street_number"),
            locationCoordinates: `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`,
          }));
        }
      });
    }
  };

  const dmsToDecimal = (deg, min, sec, direction) => {
    let decimal = deg + min / 60 + sec / 3600;
    if (["S", "W"].includes(direction)) decimal = -decimal;
    return decimal;
  };

  const handleClear = () => {
    if (coordRef.current) {
      coordRef.current.value = "";
    }

    setFormData((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
      pinCode: "",
      city: "",
      area: "",
      nagar: "",
      streetName: "",
      district: "",
      state: "",
      country: "",
      doorNumber: "",
      locationCoordinates: "",
    }));
  };

  const reduxAdminName = useSelector((state) => state.admin.name);
  const reduxAdminRole = useSelector((state) => state.admin.role);

  const adminName = reduxAdminName || localStorage.getItem("adminName");
  const adminRole = reduxAdminRole || localStorage.getItem("adminRole");

  const [allowedRoles, setAllowedRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fileName = "Add Property";

  useEffect(() => {
    if (reduxAdminName) localStorage.setItem("adminName", reduxAdminName);
    if (reduxAdminRole) localStorage.setItem("adminRole", reduxAdminRole);
  }, [reduxAdminName, reduxAdminRole]);

  useEffect(() => {
    const recordDashboardView = async () => {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/record-view`, {
          userName: adminName,
          role: adminRole,
          viewedFile: fileName,
          viewTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
      } catch (err) {}
    };

    // Skip dashboard recording for public access
    if (!isPublic && adminName && adminRole) {
      recordDashboardView();
    }
  }, [adminName, adminRole, isPublic]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/get-role-permissions`,
        );
        const rolePermissions = res.data.find(
          (perm) => perm.role === adminRole,
        );
        const viewed = rolePermissions?.viewedFiles?.map((f) => f.trim()) || [];
        setAllowedRoles(viewed);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    if (isPublic) {
      // For public access, skip permission check
      setLoading(false);
    } else if (adminRole) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [adminRole, isPublic]);

  const [dropdownState, setDropdownState] = useState({
    activeDropdown: null,
    filterText: "",
  });

  const toggleDropdown = (field) => {
    setDropdownState((prevState) => ({
      activeDropdown: prevState.activeDropdown === field ? null : field,
      filterText: "",
    }));
  };

  const handleFilterChange = (e) => {
    setDropdownState((prevState) => ({
      ...prevState,
      filterText: e.target.value,
    }));
  };

  const [countryCodes] = useState([
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+61", country: "Australia" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+34", country: "Spain" },
    { code: "+55", country: "Brazil" },
    { code: "+52", country: "Mexico" },
    { code: "+86", country: "China" },
    { code: "+39", country: "Italy" },
    { code: "+7", country: "Russia/Kazakhstan" },
  ]);

  const [dataList, setDataList] = useState({});

  const fetchDropdownData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fetch`,
      );
      const groupedData = response.data.data.reduce((acc, item) => {
        if (!acc[item.field]) acc[item.field] = [];
        acc[item.field].push(item.value);
        return acc;
      }, {});
      setDataList(groupedData);
    } catch (error) {}
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024;

    if (!files.length) return;

    for (let file of files) {
      if (file.size > maxSize) {
        alert("File size exceeds the 50MB limit");
        return;
      }
    }

    if (photos.length + files.length > 15) {
      alert("Maximum 15 photos can be uploaded.");
      return;
    }

    setUploadingPhotos(true);

    const watermarkedImages = await Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();

          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              canvas.width = img.width;
              canvas.height = img.height;

              ctx.drawImage(img, 0, 0);

              const watermarkText = "PPC Pondy";
              const fontSize = Math.max(24, Math.floor(canvas.width / 15));
              ctx.font = `bold ${fontSize}px Arial`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const centerX = canvas.width / 2;
              const centerY = canvas.height / 2;

              ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
              ctx.lineWidth = 4;
              ctx.strokeText(watermarkText, centerX, centerY);

              ctx.fillStyle = "rgba(224, 223, 223, 0.9)";
              ctx.fillText(watermarkText, centerX, centerY);

              canvas.toBlob(
                (blob) => {
                  const watermarkedFile = new File([blob], file.name, {
                    type: file.type,
                  });
                  resolve(watermarkedFile);
                },
                file.type,
                0.8,
              );
            };

            img.src = event.target.result;
          };

          reader.readAsDataURL(file);
        });
      }),
    );

    setPhotos([...photos, ...watermarkedImages]);
    setSelectedPhotoIndex(0);
    setUploadingPhotos(false);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    if (index === selectedPhotoIndex) {
      setSelectedPhotoIndex(0);
    }
  };

  const handleVideoChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 100 * 1024 * 1024;
    const validFiles = [];

    for (let file of selectedFiles) {
      if (file.size > maxSize) {
        alert(`${file.name} exceeds the 100MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    const totalFiles = [...videos, ...validFiles].slice(0, 5);
    setUploadingVideos(true);
    setVideos(totalFiles);
    setUploadingVideos(false);
  };

  const removeVideo = (indexToRemove) => {
    setVideos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePhotoSelect = (index) => {
    setSelectedPhotoIndex(index);
  };

  const convertToIndianRupees = (num) => {
    const number = parseInt(num, 10);
    if (isNaN(number)) return "";

    if (number >= 10000000) {
      return (number / 10000000).toFixed(2).replace(/\.00$/, "") + " crores";
    } else if (number >= 100000) {
      return (number / 100000).toFixed(2).replace(/\.00$/, "") + " lakhs";
    } else {
      return (
        toWords(number).replace(/\b\w/g, (l) => l.toUpperCase()) + " rupees"
      );
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      if (value !== "" && !isNaN(value)) {
        setPriceInWords(convertToIndianRupees(value));
      } else {
        setPriceInWords("");
      }
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: name === "price" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== "",
    );
    if (!isValid) {
      alert("Please fill all mandatory fields.");
      return;
    }

    try {
      let newPpcId = ppcId;

      if (!newPpcId) {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/store-id`,
        );
        if (response.status === 201 && response.data.ppcId) {
          newPpcId = response.data.ppcId;
          setPpcId(newPpcId);
          localStorage.setItem("ppcId", newPpcId);
        } else {
          alert("Failed to generate PPC-ID. Please try again.");
          return;
        }
      }

      const formDataToSend = new FormData();

      formDataToSend.append("ppcId", newPpcId);
      formDataToSend.append("status", "Complete");

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const reorderedPhotos =
        selectedPhotoIndex >= 0 && selectedPhotoIndex < photos.length
          ? [
              photos[selectedPhotoIndex],
              ...photos.filter((_, i) => i !== selectedPhotoIndex),
            ]
          : photos;
      reorderedPhotos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      videos.forEach((file) => {
        formDataToSend.append("video", file);
      });

      const propertyResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/update-property`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      // Show success alert and stay on same page
      alert(propertyResponse.data.message || "Property updated successfully!");

      // Reset form for next property submission
      setFormData({
        propertyMode: "",
        propertyType: "",
        price: "",
        priceData: "",
        propertyAge: "",
        bankLoan: "",
        negotiation: "",
        length: "",
        breadth: "",
        totalArea: "",
        ownership: "",
        bedrooms: "",
        kitchen: "",
        balconies: "",
        floorNo: "",
        areaUnit: "",
        propertyApproved: "",
        postedBy: "",
        facing: "",
        salesMode: "",
        salesType: "",
        description: "",
        furnished: "",
        lift: "",
        attachedBathrooms: "",
        western: "",
        numberOfFloors: "",
        carParking: "",
        country: "",
        state: "",
        city: "",
        district: "",
        area: "",
        streetName: "",
        doorNumber: "",
        nagar: "",
        ownerName: "",
        email: "",
        phoneNumber: "",
        phoneNumberCountryCode: "",
        alternatePhone: "",
        alternatePhoneCountryCode: "",
        bestTimeToCall: "",
        pinCode: "",
        locationCoordinates: "",
      });
      setPhotos([]);
      setVideos([]);
      setSelectedPhotoIndex(0);
      setPriceInWords("");
      // Clear ppcId from localStorage to generate new ID for next property
      setPpcId("");
      localStorage.removeItem("ppcId");
      if (inputRef.current) inputRef.current.value = "";
      if (coordRef.current) coordRef.current.value = "";
    } catch (error) {
      alert("An error occurred while submitting the property data.");
    }
  };

  useEffect(() => {
    const storedPpcId = localStorage.getItem("ppcId");
    if (!storedPpcId) {
      localStorage.removeItem("ppcId");
    }
  }, []);

  const fieldIcons = {
    phoneNumber: <FaPhone color="#2F747F" />,
    alternatePhone: <FaPhone color="#2F747F" />,
    email: <FaEnvelope color="#2F747F" />,
    bestTimeToCall: <MdSchedule color="#2F747F" />,
    country: <BiWorld color="#2F747F" />,
    state: <MdLocationCity color="#2F747F" />,
    city: <FaCity color="#2F747F" />,
    district: <FaRegAddressCard color="#2F747F" />,
    area: <MdLocationOn color="#2F747F" />,
    streetName: <RiLayoutLine color="#2F747F" />,
    doorNumber: <BiBuildingHouse color="#2F747F" />,
    nagar: <FaRegAddressCard color="#2F747F" />,
    ownerName: <FaUserAlt color="#2F747F" />,
    postedBy: <FaUserAlt color="#2F747F" />,
    ownership: <HiUserGroup color="#2F747F" />,
    propertyMode: <MdApproval color="#2F747F" />,
    propertyType: <MdOutlineOtherHouses color="#2F747F" />,
    propertyApproved: <BsFillHouseCheckFill color="#2F747F" />,
    propertyAge: <MdSchedule color="#2F747F" />,
    description: <BsTextareaT color="#2F747F" />,
    price: <FaRupeeSign color="#2F747F" />,
    bankLoan: <BsBank color="#2F747F" />,
    negotiation: <GiMoneyStack color="#2F747F" />,
    length: <MdStraighten color="#2F747F" />,
    breadth: <MdStraighten color="#2F747F" />,
    totalArea: <GiResize color="#2F747F" />,
    areaUnit: <FaChartArea color="#2F747F" />,
    bedrooms: <FaBed color="#2F747F" />,
    kitchen: <GiKitchenScale color="#2F747F" />,
    balconies: <MdOutlineMeetingRoom color="#2F747F" />,
    floorNo: <BsBuildingsFill color="#2F747F" />,
    numberOfFloors: <BsBuildingsFill color="#2F747F" />,
    attachedBathrooms: <FaBath color="#2F747F" />,
    western: <FaToilet color="#2F747F" />,
    facing: <TbArrowLeftRight color="#2F747F" />,
    salesMode: <GiGears color="#2F747F" />,
    salesType: <MdOutlineOtherHouses color="#2F747F" />,
    furnished: <FaHome color="#2F747F" />,
    lift: <BsBuildingsFill color="#2F747F" />,
    carParking: <FaCar color="#2F747F" />,
    pinCode: <TbMapPinCode color="#2F747F" />,
    locationCoordinates: <TbWorldLongitude color="#2F747F" />,
  };

  const renderDropdown = (field) => {
    const options = dataList[field] || [];
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(dropdownState.filterText.toLowerCase()),
    );

    return (
      <div data-field={field}>
        {dropdownState.activeDropdown === field && (
          <div
            className="popup-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1509,
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <div
              className="dropdown-popup"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                width: "100%",
                maxWidth: "300px",
                padding: "10px",
                zIndex: 10,
                boxShadow: "0 4px 8px rgba(0, 123, 255, 0.3)",
                borderRadius: "18px",
                animation: "popupOpen 0.3s ease-in-out",
              }}
            >
              <div
                className="p-1"
                style={{
                  fontWeight: 500,
                  fontSize: "15px",
                  marginBottom: "10px",
                  textAlign: "start",
                  color: "grey",
                }}
              >
                Select or Search
              </div>
              <div
                className="mb-1"
                style={{
                  position: "relative",
                  width: "100%",
                  background: "#EEF4FA",
                  borderRadius: "25px",
                }}
              >
                <FcSearch
                  size={16}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "black",
                  }}
                />
                <input
                  className="m-0 rounded-0 ms-1"
                  type="text"
                  placeholder="Filter options..."
                  value={dropdownState.filterText}
                  onChange={handleFilterChange}
                  style={{
                    width: "100%",
                    padding: "5px 5px 5px 30px",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                  }}
                />
              </div>

              <ul
                style={{
                  listStyleType: "none",
                  padding: 0,
                  margin: 0,
                  overflowY: "auto",
                  maxHeight: "350px",
                }}
              >
                {filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setFormData((prevState) => ({
                        ...prevState,
                        [field]: option,
                      }));
                      toggleDropdown(field);
                    }}
                    style={{
                      fontWeight: 300,
                      padding: "5px",
                      cursor: "pointer",
                      color: "grey",
                      marginBottom: "5px",
                      borderBottom: "1px solid #D0D7DE",
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  onClick={() => toggleDropdown(field)}
                  style={{
                    background: "#0B57CF",
                    cursor: "pointer",
                    border: "none",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "5px 10px",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const requiredFields = [
    "propertyMode",
    "propertyType",
    "price",
    "totalArea",
    "areaUnit",
    "salesType",
    "postedBy",
    "phoneNumber",
  ];

  const fields = [
    { name: "propertyMode", type: "select" },
    { name: "propertyType", type: "select" },
    { name: "price", type: "input" },
    { name: "negotiation", type: "select" },
    { name: "length", type: "input" },
    { name: "breadth", type: "input" },
    { name: "totalArea", type: "input" },
    { name: "areaUnit", type: "select" },
    { name: "ownership", type: "select" },
    { name: "bedrooms", type: "select" },
    { name: "kitchen", type: "select" },
    { name: "balconies", type: "select" },
    { name: "floorNo", type: "select" },
    { name: "propertyApproved", type: "select" },
    { name: "propertyAge", type: "select" },
    { name: "bankLoan", type: "select" },
    { name: "facing", type: "select" },
    { name: "salesMode", type: "select" },
    { name: "salesType", type: "select" },
    { name: "postedBy", type: "select" },
    { name: "description", type: "input" },
    { name: "furnished", type: "select" },
    { name: "lift", type: "select" },
    { name: "attachedBathrooms", type: "select" },
    { name: "western", type: "select" },
    { name: "numberOfFloors", type: "select" },
    { name: "carParking", type: "select" },
    { name: "rentalPropertyAddress", type: "input" },
    { name: "country", type: "input" },
    { name: "state", type: "input" },
    { name: "city", type: "input" },
    { name: "district", type: "select" },
    { name: "area", type: "input" },
    { name: "nagar", type: "input" },
    { name: "streetName", type: "input" },
    { name: "doorNumber", type: "input" },
    { name: "pinCode", type: "input" },
    { name: "locationCoordinates", type: "input" },
    { name: "ownerName", type: "input" },
    { name: "email", type: "input" },
    { name: "phoneNumber", type: "input" },
    { name: "alternatePhone", type: "input" },
    { name: "bestTimeToCall", type: "select" },
  ];

  const hiddenPropertyTypes = ["Plot", "Land", "Agricultural Land"];
  const fieldsToHideForPlot = [
    "furnished",
    "lift",
    "attachedBathrooms",
    "western",
    "carParking",
    "bedrooms",
    "kitchen",
    "kitchenType",
    "balconies",
    "floorNo",
  ];

  const shouldHideField = (fieldName) =>
    hiddenPropertyTypes.includes(formData.propertyType) &&
    fieldsToHideForPlot.includes(fieldName);

  if (loading) return <p>Loading...</p>;

  if (!isPublic && !allowedRoles.includes(fileName)) {
    return (
      <div className="text-center text-red-500 font-semibold text-lg mt-10">
        Only admin is allowed to view this file.
      </div>
    );
  }

  return (
    <>
      {isPublic ? (
        // PUBLIC ACCESS LAYOUT
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#F0F2F5",
            padding: "20px",
          }}
        >
          {/* Main Container - Header + Form */}
          <div className="d-flex align-items-center justify-content-center">
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  marginBottom: "0px",
                  borderRadius: "8px 8px 0 0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h1
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#2F747F",
                  }}
                >
                  Property Management
                </h1>
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  Submit your property details with photos and videos
                </p>
              </div>

              {/* Form Container */}
              <div
                style={{
                  width: "100%",
                  padding: "30px",
                  borderRadius: "0 0 8px 8px",
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <form className="addForm" onSubmit={handleSubmit}>
                  {/* Photo Upload */}
                  <div className="form-group photo-upload-container mt-2 mb-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      name="photos"
                      id="photo-upload"
                      className="photo-upload-input"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="photo-upload-label fw-normal m-0"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        padding: "12px 16px",
                        backgroundColor: "#F5F5F5",
                        borderRadius: "6px",
                        border: "2px dashed #2F747F",
                      }}
                    >
                      <MdAddPhotoAlternate
                        style={{ color: "#2e86e4", fontSize: "28px" }}
                      />
                      <span>Upload Property Images</span>
                    </label>
                  </div>

                  {uploadingPhotos ? (
                    <p>Compressing photos...</p>
                  ) : photos.length > 0 ? (
                    <div className="uploaded-photos mb-4">
                      <h5 style={{ color: "#2F747F", marginBottom: "15px" }}>
                        Uploaded Photos ({photos.length})
                      </h5>
                      <div
                        className="uploaded-photos-grid"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(100px, 1fr))",
                          gap: "10px",
                        }}
                      >
                        {photos.map((photo, index) => (
                          <div
                            key={index}
                            className="uploaded-photo-item"
                            style={{ position: "relative" }}
                          >
                            <input
                              type="radio"
                              name="selectedPhoto"
                              className="me-1"
                              checked={selectedPhotoIndex === index}
                              onChange={() => handlePhotoSelect(index)}
                              style={{
                                position: "absolute",
                                top: "5px",
                                left: "5px",
                                zIndex: 5,
                              }}
                            />
                            <img
                              src={URL.createObjectURL(photo)}
                              alt="Uploaded"
                              style={{
                                width: "100%",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                            <button
                              type="button"
                              style={{
                                border: "none",
                                background: "transparent",
                                position: "absolute",
                                top: "-10px",
                                right: "-10px",
                              }}
                              className="btn m-0 p-1"
                              onClick={() => removePhoto(index)}
                            >
                              <IoCloseCircle size={24} color="#F22952" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Video Upload */}
                  <div className="form-group mb-4">
                    <h5 style={{ color: "#2F747F", marginBottom: "10px" }}>
                      Property Video
                    </h5>
                    <input
                      type="file"
                      name="video"
                      accept="video/*"
                      id="videoUpload"
                      onChange={handleVideoChange}
                      className="d-none"
                    />
                    <label
                      htmlFor="videoUpload"
                      className="file-upload-label fw-normal"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        padding: "12px 16px",
                        backgroundColor: "#F5F5F5",
                        borderRadius: "6px",
                        border: "2px dashed #2F747F",
                      }}
                    >
                      <FaFileVideo
                        style={{ color: "#2e86e4", fontSize: "24px" }}
                      />
                      <span>Upload Property Video</span>
                    </label>

                    {uploadingVideos ? (
                      <p>Uploading videos...</p>
                    ) : videos.length > 0 ? (
                      <div className="selected-video-container mt-3">
                        <h6 style={{ color: "#2F747F" }}>
                          Selected Videos ({videos.length})
                        </h6>
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            flexWrap: "wrap",
                          }}
                        >
                          {videos.map((video, index) => (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                display: "inline-block",
                              }}
                            >
                              <video
                                width="150"
                                height="150"
                                controls
                                style={{ borderRadius: "4px" }}
                              >
                                <source
                                  src={URL.createObjectURL(video)}
                                  type="video/mp4"
                                />
                                Your browser does not support the video tag.
                              </video>
                              <button
                                type="button"
                                onClick={() => removeVideo(index)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  position: "absolute",
                                  top: "-10px",
                                  right: "-10px",
                                }}
                                className="btn m-0 p-1"
                              >
                                <IoCloseCircle size={24} color="#F22952" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Form Fields */}
                  {fields.map(({ name, type }) => {
                    if (shouldHideField(name)) return null;

                    if (name === "rentalPropertyAddress") {
                      return (
                        <div key={name} className="form-group mb-4">
                          <label
                            style={{
                              color: "#2F747F",
                              fontWeight: "bold",
                              marginBottom: "10px",
                              display: "block",
                            }}
                          >
                            Property Location
                          </label>
                          <div
                            className="input-card p-0 rounded-1"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              border: "1px solid #2F747F",
                              background: "#fff",
                            }}
                          >
                            <FcSearch
                              style={{ color: "#2F747F", marginLeft: "10px" }}
                            />
                            <input
                              ref={inputRef}
                              id="pac-input"
                              className="form-input m-0"
                              placeholder="Search location"
                              style={{
                                flex: "1 0 80%",
                                padding: "8px",
                                fontSize: "14px",
                                border: "none",
                                outline: "none",
                              }}
                            />
                          </div>
                          <div
                            ref={mapRef}
                            id="map"
                            style={{
                              height: "250px",
                              width: "100%",
                              marginTop: "10px",
                              borderRadius: "4px",
                            }}
                          ></div>

                          <div className="mt-3 w-100 d-flex gap-2 mb-2">
                            <input
                              ref={coordRef}
                              placeholder="Enter coordinates"
                              className="form-control m-0"
                              onChange={(e) =>
                                setCoordinateInput(e.target.value)
                              }
                            />
                            <button
                              className="btn btn-primary m-0 border-0"
                              type="button"
                              style={{
                                whiteSpace: "nowrap",
                                background: "#6CBAAF",
                              }}
                              onClick={() => handleLatLngAuto(coordinateInput)}
                            >
                              Go
                            </button>
                            <button
                              onClick={handleClear}
                              type="button"
                              className="btn btn-primary m-0 border-0"
                              style={{
                                whiteSpace: "nowrap",
                                background: "#B1D3C0",
                              }}
                            >
                              <MdOutlineClose color="white" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={name} className="form-group mb-3">
                        <label
                          style={{
                            color: "#2F747F",
                            fontWeight: "bold",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          {name.replace(/([A-Z])/g, " $1").trim()}
                          {requiredFields.includes(name) && (
                            <span style={{ color: "red" }}> *</span>
                          )}
                        </label>

                        {type === "select" ? (
                          <div>
                            <select
                              name={name}
                              value={formData[name] || ""}
                              onChange={handleFieldChange}
                              className="form-control"
                              required={requiredFields.includes(name)}
                              style={{
                                padding: "8px 12px",
                                border: "1px solid #2F747F",
                                borderRadius: "4px",
                                color: "#2F747F",
                              }}
                            >
                              <option value="">
                                Select {name.replace(/([A-Z])/g, " $1")}
                              </option>
                              {dataList[name]?.map((option, index) => (
                                <option key={index} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : name === "description" ? (
                          <textarea
                            name={name}
                            value={formData[name] || ""}
                            onChange={handleFieldChange}
                            required={requiredFields.includes(name)}
                            className="form-control"
                            placeholder={`Enter ${name.replace(/([A-Z])/g, " $1")}`}
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #2F747F",
                              borderRadius: "4px",
                              minHeight: "100px",
                              resize: "vertical",
                              color: "#2F747F",
                            }}
                          />
                        ) : (
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                border: "1px solid #2F747F",
                                borderRadius: "4px",
                                padding: "8px 12px",
                                backgroundColor: "#fff",
                              }}
                            >
                              {name === "phoneNumber" && (
                                <select
                                  name="phoneNumberCountryCode"
                                  value={formData.phoneNumberCountryCode || ""}
                                  onChange={handleFieldChange}
                                  className="form-control m-0"
                                  style={{
                                    width: "35%",
                                    padding: "0",
                                    border: "none",
                                    outline: "none",
                                    fontSize: "13px",
                                  }}
                                >
                                  <option value="">Code</option>
                                  {countryCodes.map((item, index) => (
                                    <option key={index} value={item.code}>
                                      {item.code}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {name === "alternatePhone" && (
                                <select
                                  name="alternatePhoneCountryCode"
                                  value={
                                    formData.alternatePhoneCountryCode || ""
                                  }
                                  onChange={handleFieldChange}
                                  className="form-control m-0"
                                  style={{
                                    width: "35%",
                                    padding: "0",
                                    border: "none",
                                    outline: "none",
                                    fontSize: "13px",
                                  }}
                                >
                                  <option value="">Code</option>
                                  {countryCodes.map((item, index) => (
                                    <option key={index} value={item.code}>
                                      {item.code}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <input
                                type={name === "email" ? "email" : "text"}
                                name={name}
                                value={formData[name] || ""}
                                onChange={handleFieldChange}
                                required={requiredFields.includes(name)}
                                className="form-control m-0"
                                placeholder={`Enter ${name.replace(/([A-Z])/g, " $1")}`}
                                style={{
                                  border: "none",
                                  outline: "none",
                                  color: "#2F747F",
                                  flex: 1,
                                  padding: "0",
                                }}
                              />
                            </div>

                            {name === "price" && priceInWords && (
                              <p
                                style={{
                                  fontSize: "13px",
                                  color: "#2F747F",
                                  marginTop: "5px",
                                  fontStyle: "italic",
                                }}
                              >
                                ({priceInWords})
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#2F747F",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      marginTop: "20px",
                    }}
                  >
                    Submit Property
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ADMIN/DASHBOARD LAYOUT
        <div className="d-flex align-items-center justify-content-center">
          <div
            style={{
              width: "100%",
              maxWidth: "450px",
              minWidth: "300px",
              padding: "5px",
              borderRadius: "8px",
              margin: "0 5px",
            }}
          >
            <h1>Property Management</h1>
            <form className="addForm" onSubmit={handleSubmit}>
              <p
                className="p-3"
                style={{ color: "white", backgroundColor: "rgb(47,116,127)" }}
              >
                PPC-ID: {ppcId}
              </p>

              <h4
                style={{
                  color: "rgb(47,116,127)",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Property Images
              </h4>

              <div className="form-group photo-upload-container mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  name="photos"
                  id="photo-upload"
                  className="photo-upload-input"
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="photo-upload"
                  className="photo-upload-label fw-normal m-0"
                >
                  <MdAddPhotoAlternate
                    style={{
                      color: "white",
                      backgroundColor: "#2e86e4",
                      padding: "5px",
                      fontSize: "30px",
                      borderRadius: "50%",
                      marginRight: "5px",
                    }}
                  />
                  Upload Your Property Images
                </label>
              </div>

              {uploadingPhotos ? (
                <p>Compressing...</p>
              ) : (
                photos.length > 0 && (
                  <div className="uploaded-photos">
                    <h4>Uploaded Photos</h4>
                    <div className="uploaded-photos-grid">
                      {photos.map((photo, index) => (
                        <div key={index} className="uploaded-photo-item">
                          <input
                            type="radio"
                            name="selectedPhoto"
                            className="me-1"
                            checked={selectedPhotoIndex === index}
                            onChange={() => handlePhotoSelect(index)}
                          />

                          <img
                            src={URL.createObjectURL(photo)}
                            alt="Uploaded"
                            className="uploaded-photo mb-3"
                          />
                          <button
                            style={{
                              border: "none",
                              background: "transparent",
                            }}
                            className="position-absolute top-0 end-0 btn m-0 p-1"
                            onClick={() => removePhoto(index)}
                            type="button"
                          >
                            <IoCloseCircle size={20} color="#F22952" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              <h4
                style={{
                  color: "rgb(47,116,127)",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Property Video
              </h4>
              <div className="form-group">
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  id="videoUpload"
                  onChange={handleVideoChange}
                  className="d-none"
                />
                <label
                  htmlFor="videoUpload"
                  className="file-upload-label fw-normal"
                >
                  <span className="pt-5">
                    <FaFileVideo
                      style={{
                        color: "white",
                        backgroundColor: "#2e86e4",
                        padding: "5px",
                        fontSize: "30px",
                        marginRight: "5px",
                      }}
                    />
                    Upload Property Video
                  </span>
                </label>

                {uploadingVideos ? (
                  <p>Uploading...</p>
                ) : (
                  videos.length > 0 && (
                    <div className="selected-video-container mt-3">
                      <h5 className="text-start">Selected Videos:</h5>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        {videos.map((video, index) => (
                          <div
                            key={index}
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <video width="200" height="200" controls>
                              <source
                                src={URL.createObjectURL(video)}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                            <Button
                              variant="danger"
                              onClick={() => removeVideo(index)}
                              style={{
                                border: "none",
                                background: "transparent",
                              }}
                              className="position-absolute top-0 end-0 m-1 p-1"
                            >
                              <IoCloseCircle size={20} color="#F22952" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {fields.map(({ name, type }) => {
                if (shouldHideField(name)) return null;

                if (name === "rentalPropertyAddress") {
                  return (
                    <div key={name} className="form-group">
                      <div className="form-group">
                        <div
                          className="input-card p-0 rounded-1"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            border: "1px solid #2F747F",
                            background: "#fff",
                          }}
                        >
                          <FcSearch
                            className="input-icon"
                            style={{ color: "#2F747F", marginLeft: "10px" }}
                          />
                          <input
                            ref={inputRef}
                            id="pac-input"
                            className="form-input m-0"
                            placeholder="Search location"
                            style={{
                              flex: "1 0 80%",
                              padding: "8px",
                              fontSize: "14px",
                              border: "none",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        ref={mapRef}
                        id="map"
                        style={{ height: "200px", width: "100%" }}
                      ></div>

                      <div className="mt-3 w-100 d-flex gap-2 mb-2">
                        <input
                          ref={coordRef}
                          placeholder="Enter Your Property Coordinates"
                          className="form-control m-0"
                          onChange={(e) => setCoordinateInput(e.target.value)}
                        />
                        <button
                          className="btn btn-primary m-0 border-0"
                          type="button"
                          style={{
                            whiteSpace: "nowrap",
                            background: "#6CBAAF",
                          }}
                          onClick={() => handleLatLngAuto(coordinateInput)}
                        >
                          Go
                        </button>

                        <button
                          onClick={handleClear}
                          type="button"
                          className="btn btn-primary m-0 border-0"
                          style={{
                            whiteSpace: "nowrap",
                            background: "#B1D3C0",
                          }}
                        >
                          <MdOutlineClose color="white" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={name} className="form-group">
                    <label
                      style={{
                        color: "#2F747F",
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      {name.replace(/([A-Z])/g, " $1").trim()}
                      {requiredFields.includes(name) && (
                        <span style={{ color: "red" }}> * </span>
                      )}
                    </label>

                    {type === "select" ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ flex: "1" }}>
                          <label>
                            <select
                              name={name}
                              value={formData[name] || ""}
                              onChange={handleFieldChange}
                              className="form-control"
                              required={requiredFields.includes(name)}
                              style={{ display: "none" }}
                            >
                              <option value="">
                                Select {name.replace(/([A-Z])/g, " $1")}
                              </option>
                              {dataList[name]?.map((option, index) => (
                                <option key={index} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => toggleDropdown(name)}
                              style={{
                                cursor: "pointer",
                                border: "1px solid #2F747F",
                                padding: "10px",
                                background: "#fff",
                                borderRadius: "5px",
                                width: "100%",
                                textAlign: "left",
                                color: "#2F747F",
                              }}
                            >
                              <span style={{ marginRight: "10px" }}>
                                {fieldIcons[name] || <FaHome />}
                              </span>
                              {formData[name] ||
                                `Select ${name.replace(/([A-Z])/g, " $1")}`}
                            </button>

                            {renderDropdown(name)}
                          </label>
                        </div>
                      </div>
                    ) : name === "description" ? (
                      <div
                        className="input-card p-0 rounded-1"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          border: "1px solid #2F747F",
                          background: "#fff",
                        }}
                      >
                        <span
                          className="input-icon"
                          style={{ color: "#2F747F", marginLeft: "10px" }}
                        >
                          {fieldIcons[name] || <FaEdit />}
                        </span>
                        <textarea
                          name={name}
                          value={formData[name] || ""}
                          onChange={handleFieldChange}
                          required={requiredFields.includes(name)}
                          className="form-input m-0"
                          placeholder={`Enter ${name.replace(/([A-Z])/g, " $1")}`}
                          style={{
                            flex: "1 0 70%",
                            padding: "8px",
                            fontSize: "14px",
                            border: "none",
                            outline: "none",
                            minHeight: "100px",
                            resize: "vertical",
                            color: "#2F747F",
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div
                          className="input-card p-0 rounded-1"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            border: "1px solid #2F747F",
                            background: "#fff",
                          }}
                        >
                          <span
                            className="input-icon"
                            style={{ color: "#2F747F", marginLeft: "10px" }}
                          >
                            {fieldIcons[name] || <FaEdit />}
                          </span>

                          {name === "phoneNumber" && (
                            <select
                              name="phoneNumberCountryCode"
                              value={formData.phoneNumberCountryCode || ""}
                              onChange={handleFieldChange}
                              className="form-control m-0"
                              style={{
                                width: "30%",
                                padding: "8px",
                                fontSize: "14px",
                                border: "none",
                                outline: "none",
                              }}
                            >
                              <option value="">Select Country Code</option>
                              {countryCodes.map((item, index) => (
                                <option key={index} value={item.code}>
                                  {item.code} - {item.country}
                                </option>
                              ))}
                            </select>
                          )}

                          {name === "alternatePhone" && (
                            <select
                              name="alternatePhoneCountryCode"
                              value={formData.alternatePhoneCountryCode || ""}
                              onChange={handleFieldChange}
                              className="form-control m-0"
                              style={{
                                width: "30%",
                                padding: "8px",
                                fontSize: "14px",
                                border: "none",
                                outline: "none",
                              }}
                            >
                              <option value="">Select Country Code</option>
                              {countryCodes.map((item, index) => (
                                <option key={index} value={item.code}>
                                  {item.code} - {item.country}
                                </option>
                              ))}
                            </select>
                          )}

                          <input
                            type={name === "email" ? "email" : "text"}
                            name={name}
                            value={formData[name] || ""}
                            onChange={handleFieldChange}
                            required={requiredFields.includes(name)}
                            className="form-input m-0"
                            placeholder={`Enter ${name.replace(/([A-Z])/g, " $1")}`}
                            style={{
                              flex: "1 0 70%",
                              padding: "8px",
                              fontSize: "14px",
                              border: "none",
                              outline: "none",
                              color: "#2F747F",
                            }}
                          />
                        </div>

                        {name === "price" && priceInWords && (
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#2F747F",
                              marginTop: "5px",
                            }}
                          >
                            {priceInWords}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              <button
                type="submit"
                style={{ background: "#2F747F", color: "#fff" }}
              >
                Save Property
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddMarketingProperty;
