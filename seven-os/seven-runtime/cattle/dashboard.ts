<Button onClick={() => moveBoundary("north", 500)}>
  Move Line North 500 ft
</Button>

<Slider
  min={-1000}
  max={1000}
  onChange={(v) => moveBoundary("east", v)}
/>

<MapEditor
  boundary={pastureBoundary}
  onBoundaryChange={(newBoundary) => saveBoundary(newBoundary)}
/>
