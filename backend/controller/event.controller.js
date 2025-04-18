const mongoose = require("mongoose");

const orgModel = require("../models/org.model");
const userModel = require("../models/user.model");
const departmentModel = require("../models/department.model");
const eventModel = require("../models/event.model");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      tag,
      department,
      category,
      startDate,
      regStartDate,
      endDate,
      regEndDate,
      startTime,
      endTime,
      numberOfDays,
      maxParticipants,
      mode,
      venue,
      collaboration,
      budget,
      budgetAmount,
      certificate,
    } = req.body;

    // Validate tags array
    if (!Array.isArray(tag) || tag.length === 0) {
      return res.status(400).json({
        message: "Tags must be a non-empty array",
      });
    }

    // Validate department ID format
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        message: "Invalid department ID format",
      });
    }

    const dept = await departmentModel.findById(department);
    if (!dept || !dept.category.includes(category)) {
      return res.status(400).json({
        message: "Invalid or unapproved category for this department",
      });
    }

    // Check if department exists and get organization ID
    const departmentExists = await departmentModel.findById(department);
    if (!departmentExists) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // Get organization ID from department
    const organizationId = departmentExists.organization;

    // Create new event with tags
    const newEvent = new eventModel({
      title,
      description,
      tag, // Added new field
      department,
      category,
      startDate,
      regStartDate,
      endDate,
      regEndDate,
      startTime,
      endTime,
      numberOfDays,
      maxParticipants,
      mode,
      venue,
      collaboration: collaboration || [],
      budget,
      budgetAmount,
      certificate,
      proposedBy: req.user._id,
    });

    const savedEvent = await newEvent.save();

    // Update primary department
    await departmentModel.findByIdAndUpdate(department, {
      $push: { event: savedEvent._id },
    });

    // Update organization
    await orgModel.findByIdAndUpdate(organizationId, {
      $push: { event: savedEvent._id },
    });

    // Rest of your existing collaboration handling code...

    res.status(201).json({
      message: "Event created successfully",
      event: savedEvent,
    });
  } catch (error) {
    console.error("Event Creation Error:", error);
    res.status(500).json({
      message: "Failed to create event " + error.message,
      error: error.message,
    });
  }
};

exports.editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      department,
      category,
      startDate,
      regStartDate,
      endDate,
      regEndDate,
      startTime,
      endTime,
      numberOfDays,
      maxParticipants,
      mode,
      venue,
      collaboration,
      budget,
      budgetAmount,
      certificate,
      approvalStatus,
      remarks,
      summary,
    } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID format",
      });
    }

    // Find existing event
    const existingEvent = await eventModel.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Handle collaboration updates
    if (collaboration) {
      // Validate new collaboration department IDs
      const validDepts = await departmentModel.find({
        _id: { $in: collaboration },
      });

      if (validDepts.length !== collaboration.length) {
        return res.status(400).json({
          message: "One or more collaborating departments not found",
        });
      }

      // Remove event from old collaborating departments
      if (existingEvent.collaboration.length > 0) {
        await departmentModel.updateMany(
          { _id: { $in: existingEvent.collaboration } },
          { $pull: { event: eventId } }
        );
      }

      // Add event to new collaborating departments
      await departmentModel.updateMany(
        { _id: { $in: collaboration } },
        { $push: { event: eventId } }
      );
    }

    // Validate dates if being updated
    if (startDate || endDate || regStartDate || regEndDate) {
      const dates = {
        regStart: new Date(regStartDate || existingEvent.regStartDate),
        regEnd: new Date(regEndDate || existingEvent.regEndDate),
        start: new Date(startDate || existingEvent.startDate),
        end: new Date(endDate || existingEvent.endDate),
      };

      if (dates.regStart > dates.regEnd || dates.start > dates.end) {
        return res.status(400).json({
          message: "Invalid date range",
        });
      }

      if (dates.regEnd > dates.start) {
        return res.status(400).json({
          message: "Registration should end before event starts",
        });
      }
    }

    // Create update object with only provided fields
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(department && { department }),
      ...(category && { category }),
      ...(startDate && { startDate }),
      ...(regStartDate && { regStartDate }),
      ...(endDate && { endDate }),
      ...(regEndDate && { regEndDate }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(numberOfDays && { numberOfDays }),
      ...(maxParticipants && { maxParticipants }),
      ...(mode && { mode }),
      ...(venue && { venue }),
      ...(collaboration && { collaboration }),
      ...(budget && { budget }),
      ...(budgetAmount && { budgetAmount }),
      ...(certificate !== undefined && { certificate }),
      ...(approvalStatus && {
        approvalStatus,
        statusUpdatedBy: req.user._id,
      }),
      ...(remarks && { remarks }),
      ...(summary && { summary }),
      updatedAt: Date.now(),
    };

    // Update event
    const updatedEvent = await eventModel.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Event Update Error:", error);
    res.status(500).json({
      message: "Failed to update event",
      error: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID format",
      });
    }

    // Find existing event with populated department to get organization ID
    const existingEvent = await eventModel
      .findById(eventId)
      .populate("department", "organization");

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Get organization ID from the populated department
    const organizationId = existingEvent.department.organization;

    // Remove event reference from primary department
    await departmentModel.findByIdAndUpdate(existingEvent.department._id, {
      $pull: { event: eventId },
    });

    // Remove event reference from organization
    await orgModel.findByIdAndUpdate(organizationId, {
      $pull: { event: eventId },
    });

    // Remove event reference from collaborating departments
    if (existingEvent.collaboration.length > 0) {
      await departmentModel.updateMany(
        { _id: { $in: existingEvent.collaboration } },
        { $pull: { event: eventId } }
      );
    }

    // Delete event
    await eventModel.findByIdAndDelete(eventId);

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Event Deletion Error:", error);
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

exports.acceptEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { remarks } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID format",
      });
    }

    // Find event and populate necessary fields
    const event = await eventModel
      .findById(eventId)
      .populate("department")
      .populate("proposedBy", "email");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check if event is already approved/rejected
    if (event.approvalStatus !== "Pending") {
      return res.status(400).json({
        message: `Event is already ${event.approvalStatus.toLowerCase()}`,
      });
    }

    // Update event approval status
    const updatedEvent = await eventModel.findByIdAndUpdate(
      eventId,
      {
        approvalStatus: "Approved",
        remarks: remarks || "Event approved",
        statusUpdatedBy: req.user._id,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Event accepted successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Event Acceptance Error:", error);
    res.status(500).json({
      message: "Failed to accept event",
      error: error.message,
    });
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { remarks } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID format",
      });
    }

    // Validate remarks for rejection
    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({
        message: "Remarks are required when rejecting an event",
      });
    }

    // Find event and populate necessary fields
    const event = await eventModel
      .findById(eventId)
      .populate("department")
      .populate("proposedBy", "email");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check event status first
    if (event.status !== "Upcoming") {
      return res.status(400).json({
        message: `Cannot reject event with status: ${event.status}. Event must be Upcoming`,
      });
    }

    // Check if event is already approved/rejected
    if (event.approvalStatus !== "Pending") {
      return res.status(400).json({
        message: `Cannot reject event. Current status: ${event.approvalStatus}`,
      });
    }

    // Update event approval status
    const updatedEvent = await eventModel.findByIdAndUpdate(
      eventId,
      {
        approvalStatus: "Rejected",
        remarks: remarks,
        statusUpdatedBy: req.user._id,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Event rejected successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Event Rejection Error:", error);
    res.status(500).json({
      message: "Failed to reject event",
      error: error.message,
    });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find()
      .populate("department", "name type")
      .populate("proposedBy", "Name email")
      .populate("collaboration", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get All Events Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve events",
      error: error.message,
    });
  }
};

exports.getOAllEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const org = await orgModel.findOne({ admins: userId }).lean();
    if (!org) {
      return res.status(403).json({
        success: false,
        message: "You are not an admin of any organization.",
      });
    }
    const orgDepartments = await departmentModel
      .find({ organization: org._id }, "_id")
      .lean();
    const deptIds = orgDepartments.map((d) => d._id.toString());

    const filter = { department: { $in: deptIds } };
    
    const events = await eventModel
      .find(filter)
      .populate("department", "name type")
      .populate("proposedBy", "Name email")
      .populate("collaboration", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get All Events Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve events",
      error: error.message,
    });
  }
};

exports.getOneEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await eventModel
      .findById(eventId)
      .populate("department", "name type")
      .populate("proposedBy", "Name email")
      .populate("collaboration", "name")
      .populate("internalParticipants", "name email")
      .populate("externalParticipants", "name email")
      .populate("attendedParticipants", "name email");
    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get Event Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve events",
      error: error.message,
    });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID format",
      });
    }

    // Find event and populate necessary fields
    const event = await eventModel
      .findById(eventId)
      .populate("department")
      .populate("internalParticipants")
      .populate("externalParticipants");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check if event is approved
    if (event.approvalStatus !== "Approved") {
      return res.status(400).json({
        message: "Cannot register for an unapproved event",
      });
    }

    // Check registration deadline
    if (new Date() > new Date(event.regEndDate)) {
      return res.status(400).json({
        message: "Registration deadline has passed",
      });
    }

    // Check if user is already registered
    const isInternalParticipant = event.internalParticipants.some(
      (participant) => participant._id.toString() === userId.toString()
    );
    const isExternalParticipant = event.externalParticipants.some(
      (participant) => participant._id.toString() === userId.toString()
    );

    if (isInternalParticipant || isExternalParticipant) {
      return res.status(400).json({
        message: "You are already registered for this event",
      });
    }

    // Check if event has reached maximum participants
    const totalParticipants =
      event.internalParticipants.length + event.externalParticipants.length;
    if (totalParticipants >= event.maxParticipants) {
      return res.status(400).json({
        message: "Event has reached maximum participant capacity",
      });
    }

    // Determine if user is internal or external based on department membership
    const user = await userModel.findById(userId).populate("departments");
    const isInternalUser = user.departments.some(
      (dept) =>
        dept._id.toString() === event.department._id.toString() ||
        event.collaboration.includes(dept._id)
    );

    // Update appropriate participants array
    const updateField = isInternalUser
      ? "internalParticipants"
      : "externalParticipants";
    const updatedEvent = await eventModel.findByIdAndUpdate(
      eventId,
      { $push: { [updateField]: userId } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Successfully registered for event",
      participantType: isInternalUser ? "internal" : "external",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Event Registration Error:", error);
    res.status(500).json({
      message: "Failed to register for event",
      error: error.message,
    });
  }
};

exports.deregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID format",
      });
    }

    // Find event
    const event = await eventModel
      .findById(eventId)
      .populate("internalParticipants")
      .populate("externalParticipants");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }
    // Check if registration period has started
    if (new Date() < new Date(event.regStartDate)) {
      return res.status(400).json({
        message: "Registration period has not started yet",
      });
    }

    // Find and remove user from appropriate participants array
    const isInternalParticipant = event.internalParticipants.some(
      (participant) => participant._id.toString() === userId.toString()
    );
    const isExternalParticipant = event.externalParticipants.some(
      (participant) => participant._id.toString() === userId.toString()
    );

    if (!isInternalParticipant && !isExternalParticipant) {
      return res.status(400).json({
        message: "You are not registered for this event",
      });
    }

    const updateField = isInternalParticipant
      ? "internalParticipants"
      : "externalParticipants";
    const updatedEvent = await eventModel.findByIdAndUpdate(
      eventId,
      { $pull: { [updateField]: userId } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Successfully deregistered from event",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Event Deregistration Error:", error);
    res.status(500).json({
      message: "Failed to deregister from event",
      error: error.message,
    });
  }
};

exports.getDepartmentEvents = async (req, res) => {
  try {
    const { deptId } = req.params;

    const events = await eventModel
      .find({ department: deptId })
      .populate("department", "name")
      .populate("proposedBy", "name email");

    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching department events", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Multer for Excel upload
const upload = multer({ dest: "uploads/" });

// ==== [1.2] uploadSummary with feedback on unrecognized and unregistered emails ====

exports.uploadSummary = [
  upload.single("excel"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { summary, participantEmails } = req.body;

      const event = await eventModel.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });

      let emails = [];

      // If excel file is uploaded
      if (req.file) {
        const filePath = path.join(__dirname, "../", req.file.path);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        emails = data.map((row) => row.email).filter(Boolean);
        fs.unlinkSync(filePath); // Clean up
      } else if (participantEmails) {
        emails = JSON.parse(participantEmails);
      }

      // Validate all emails are in correct format
      const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter((email) => validEmailRegex.test(email));
      const invalidEmails = emails.filter(
        (email) => !validEmailRegex.test(email)
      );

      const participants = await userModel.find({
        email: { $in: validEmails },
      });
      const participantMap = new Map(
        participants.map((u) => [u.email, u._id.toString()])
      );

      const internalIds = event.internalParticipants.map((id) => id.toString());
      const externalIds = event.externalParticipants.map((id) => id.toString());

      const validAttendees = [];
      const unregisteredEmails = [];
      const uniqueValidEmails = [...new Set(validEmails)];

      for (const email of uniqueValidEmails) {
        const userId = participantMap.get(email);
        if (
          userId &&
          (internalIds.includes(userId) || externalIds.includes(userId))
        ) {
          validAttendees.push(userId);
        } else {
          unregisteredEmails.push(email);
        }
      }

      event.attendedParticipants = validAttendees;
      event.summary = summary;
      event.approvalStatus = "Freezed";

      await event.save();

      res.status(200).json({
        message: "Summary uploaded successfully",
        markedPresent: validAttendees.length,
        submitted: emails.length,
        invalidEmails,
        unregisteredEmails,
        event,
      });
    } catch (error) {
      console.error("Upload Summary Error:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
];
