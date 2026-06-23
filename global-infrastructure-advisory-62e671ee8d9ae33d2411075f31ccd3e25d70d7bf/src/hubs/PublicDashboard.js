// Inside your PublicDashboard.js
const [blueprint, setBlueprint] = useState(null);

useEffect(() => {
  const fetchBlueprint = () => {
    fetch('/api/public/ai-map')
      .then(res => res.json())
      .then(data => setBlueprint(data));
  };

  fetchBlueprint();
  const interval = setInterval(fetchBlueprint, 15 * 60 * 1000); // Refresh every 15 mins
  return () => clearInterval(interval);
}, []);
