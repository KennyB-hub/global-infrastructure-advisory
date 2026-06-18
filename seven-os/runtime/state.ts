drones: stack.droneRegistry.list().map(d => ({
    id: d.id,
    model: d.model,
    capabilities: d.capabilities
})),

groundUnits: stack.groundRegistry.list().map(u => ({
    id: u.id,
    type: u.type
})),
