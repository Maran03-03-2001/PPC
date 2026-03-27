import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaPrint } from "react-icons/fa";
import { Table, Modal, Button } from "react-bootstrap";

const FollowUpBuyerGetTable = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const printRef = useRef();
  const [allData, setAllData] = useState([]); // store unfiltered data for future use

  // Create Follow-Up Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    ba_id: "N/A",
    phoneNumber: "",
    followupStatus: "",
    followupType: "",
    followupDate: "",
    adminName: "",
  });

  // Edit Follow-Up Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFollowupId, setSelectedFollowupId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    ba_id: "N/A",
    phoneNumber: "",
    followupStatus: "",
    followupType: "",
    followupDate: "",
    adminName: "",
  });

  // Fetch all followups
  const fetchAllFollowUps = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/followup-list-buyer`,
      );
      setFollowups(res.data.data);
      setAllData(res.data.data);
    } catch (error) {
      console.error("Error fetching all follow-up data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch followups based on dateFilter (today/past)
  const fetchFilteredFollowUps = async (filterType) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/followup-list-today-past-buyer?dateFilter=${filterType}`,
      );
      setFollowups(res.data.data);
    } catch (error) {
      console.error(`Error fetching ${filterType} follow-up data:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAllFollowUps();
  }, []);

  // Date range filter
  const handleDateFilter = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = allData.filter((item) => {
      const followUpDate = new Date(item.followupDate);
      return followUpDate >= start && followUpDate <= end;
    });
    setFollowups(filtered);
  };

  // Future follow-up filter
  const handleFutureFollowUps = () => {
    const today = new Date();
    const filtered = allData.filter((item) => {
      const followUpDate = new Date(item.followupDate);
      return followUpDate > today;
    });
    setFollowups(filtered);
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // Handle create form input change
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle create follow-up
  const handleCreateFollowUp = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !createFormData.phoneNumber ||
      !createFormData.followupStatus ||
      !createFormData.followupType ||
      !createFormData.followupDate
    ) {
      alert(
        "⚠️ Please fill all required fields (Phone Number, Status, Type, Date)",
      );
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/followup-create-buyer`,
        createFormData,
      );

      if (response.status === 201) {
        alert("✅ Follow-up created successfully!");
        setShowCreateModal(false);
        setCreateFormData({
          ba_id: "N/A",
          phoneNumber: "",
          followupStatus: "",
          followupType: "",
          followupDate: "",
          adminName: "",
        });

        // Refresh the list
        fetchAllFollowUps();
      }
    } catch (error) {
      alert(
        "❌ Failed to create follow-up!\n" +
          (error.response?.data?.message || error.message),
      );
      console.error("Error creating follow-up:", error);
    }
  };

  // Handle close create modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      ba_id: "N/A",
      phoneNumber: "",
      followupStatus: "",
      followupType: "",
      followupDate: "",
      adminName: "",
    });
  };

  // Handle edit button click
  const handleEditClick = (item) => {
    setSelectedFollowupId(item._id);
    setEditFormData({
      ba_id: item.ba_id,
      phoneNumber: item.phoneNumber,
      followupStatus: item.followupStatus,
      followupType: item.followupType,
      followupDate: item.followupDate.split("T")[0], // Format date for input
      adminName: item.adminName,
    });
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle update follow-up
  const handleUpdateFollowUp = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !editFormData.phoneNumber ||
      !editFormData.followupStatus ||
      !editFormData.followupType ||
      !editFormData.followupDate
    ) {
      alert(
        "⚠️ Please fill all required fields (Phone Number, Status, Type, Date)",
      );
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/followup-update-buyer/${selectedFollowupId}`,
        editFormData,
      );

      if (response.status === 200 || response.status === 201) {
        alert("✅ Follow-up updated successfully!");
        setShowEditModal(false);
        setSelectedFollowupId(null);
        setEditFormData({
          ba_id: "N/A",
          phoneNumber: "",
          followupStatus: "",
          followupType: "",
          followupDate: "",
          adminName: "",
        });

        // Refresh the list
        fetchAllFollowUps();
      }
    } catch (error) {
      alert(
        "❌ Failed to update follow-up!\n" +
          (error.response?.data?.message || error.message),
      );
      console.error("Error updating follow-up:", error);
    }
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFollowupId(null);
    setEditFormData({
      ba_id: "N/A",
      phoneNumber: "",
      followupStatus: "",
      followupType: "",
      followupDate: "",
      adminName: "",
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Buyer Follow-Up List</h2>

      {/* Filter Buttons */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div className="space-x-2">
          <button
            className="btn btn-secondary ms-2"
            onClick={fetchAllFollowUps}
          >
            All Follow-Up
          </button>
          <button
            className="btn btn-success ms-2"
            onClick={() => fetchFilteredFollowUps("today")}
          >
            Today Follow-Up
          </button>
          <button
            className="btn btn-warning ms-2"
            onClick={() => fetchFilteredFollowUps("past")}
          >
            Past Follow-Up
          </button>
          <button className="btn btn-info ms-2" onClick={handleFutureFollowUps}>
            Future Follow-Up
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Follow
        </button>
      </div>

      {/* Date Range Filter */}
      <div
        style={{
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          padding: "20px",
          backgroundColor: "#fff",
        }}
        className="d-flex flex-row gap-2 align-items-center flex-nowrap mb-3"
      >
        <label className="mr-2">Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="form-control mr-2"
        />
        <label className="mr-2">End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="form-control mr-2"
        />
        <button onClick={handleDateFilter} className="btn btn-primary">
          Filter
        </button>
      </div>

      {/* Actions */}
      <div className="mb-3">
        <button className="btn btn-success me-2" onClick={handlePrint}>
          <FaPrint /> Print All
        </button>
        <button className="btn btn-info" onClick={fetchAllFollowUps}>
          Refresh
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <p>Loading...</p>
      ) : followups.length === 0 ? (
        <p>No follow-up records found.</p>
      ) : (
        <div ref={printRef}>
          <h3 className="mt-5 mb-3">Buyer Follow-Up Data</h3>
          <Table
            striped
            bordered
            hover
            responsive
            className="table-sm align-middle"
          >
            <thead className="sticky-top">
              <tr className="bg-gray-100 text-center">
                <th>S.No</th>
                <th>BA ID</th>
                <th>Phone Number</th>
                <th>Follow-Up Status</th>
                <th>Follow-Up Type</th>
                <th>Follow-Up Date</th>
                <th>Admin Name</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {followups.map((item, index) => (
                <tr key={item._id} className="text-center">
                  <td>{index + 1}</td>
                  <td>{item.ba_id}</td>
                  <td>{item.phoneNumber || "-"}</td>
                  <td>{item.followupStatus}</td>
                  <td>{item.followupType}</td>
                  <td>{new Date(item.followupDate).toLocaleDateString()}</td>
                  <td>{item.adminName}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Edit Follow-Up Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Follow-Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdateFollowUp}>
            <div className="mb-3">
              <label className="form-label">BA ID</label>
              <input
                type="text"
                className="form-control"
                name="ba_id"
                value={editFormData.ba_id}
                disabled
                placeholder="N/A"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                name="phoneNumber"
                value={editFormData.phoneNumber}
                onChange={handleEditFormChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Follow-Up Status *</label>
              <select
                className="form-control"
                name="followupStatus"
                value={editFormData.followupStatus}
                onChange={handleEditFormChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Ring">Ring</option>
                <option value="Ready To Pay">Ready To Pay</option>
                <option value="Not Decided">Not Decided</option>
                <option value="Not Interested-Closed">
                  Not Interested-Closed
                </option>
                <option value="Paid Closed">Paid Closed</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Follow-Up Type *</label>
              <select
                className="form-control"
                name="followupType"
                value={editFormData.followupType}
                onChange={handleEditFormChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Payment Followup">Payment Followup</option>
                <option value="Data Followup">Data Followup</option>
                <option value="Enquiry Followup">Enquiry Followup</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Follow-Up Date *</label>
              <input
                type="date"
                className="form-control"
                name="followupDate"
                value={editFormData.followupDate}
                onChange={handleEditFormChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Admin Name *</label>
              <select
                className="form-control"
                name="adminName"
                value={editFormData.adminName}
                onChange={handleEditFormChange}
                required
              >
                <option value="">Select Admin Name</option>
                <option value="Bala">Bala</option>
                <option value="Madhan">Madhan</option>
                <option value="Lathika Arul">Sharvesh</option>
                <option value="Lathika Arul">Avinesh</option>
                <option value="Lathika Arul">Lathika</option>
                <option value="Lathika Arul">Pugal</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={handleCloseEditModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Follow-Up
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Create Follow-Up Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Follow-Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreateFollowUp}>
            <div className="mb-3">
              <label className="form-label">BA ID</label>
              <input
                type="text"
                className="form-control"
                name="ba_id"
                value={createFormData.ba_id}
                disabled
                placeholder="N/A"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                name="phoneNumber"
                value={createFormData.phoneNumber}
                onChange={handleCreateFormChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Follow-Up Status *</label>
              <select
                className="form-control"
                name="followupStatus"
                value={createFormData.followupStatus}
                onChange={handleCreateFormChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Ring">Ring</option>
                <option value="Ready To Pay">Ready To Pay</option>
                <option value="Not Decided">Not Decided</option>
                <option value="Not Interested-Closed">
                  Not Interested-Closed
                </option>
                <option value="Paid Closed">Paid Closed</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Follow-Up Type *</label>
              <select
                className="form-control"
                name="followupType"
                value={createFormData.followupType}
                onChange={handleCreateFormChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Payment Followup">Payment Followup</option>
                <option value="Data Followup">Data Followup</option>
                <option value="Enquiry Followup">Enquiry Followup</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Follow-Up Date *</label>
              <input
                type="date"
                className="form-control"
                name="followupDate"
                value={createFormData.followupDate}
                onChange={handleCreateFormChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Admin Name *</label>
              <select
                className="form-control"
                name="adminName"
                value={createFormData.adminName}
                onChange={handleCreateFormChange}
                required
              >
                <option value="">Select Admin Name</option>
                <option value="Bala">Bala</option>
                <option value="Madhan">Madhan</option>
                <option value="Lathika Arul">Sharvesh</option>
                <option value="Lathika Arul">Avinesh</option>
                <option value="Lathika Arul">Lathika</option>
                <option value="Lathika Arul">Pugal</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={handleCloseCreateModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Follow-Up
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FollowUpBuyerGetTable;
