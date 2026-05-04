// Add to your existing SectorSync.sanitize(data) logic:

sanitize(data) {
    const { 
        medication_batch_id, // Hide the specific batch ID from the public map
        breeding_cost,       // Hide financial data
        nato_clearance,      // Hide Gov metadata
        ...publicView 
    } = data;

    // Add "Farmer-Ready" alerts
    if (data.status === "CALVING_ALERT") {
        publicView.alert_priority = "CRITICAL";
        publicView.display_msg = "Calving Imminent: Monitor Pen 4";
    }

    return publicView;
}
