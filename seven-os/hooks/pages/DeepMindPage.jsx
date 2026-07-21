import { useDeepMind } from "../../frontend/hooks/useDeepMind";

export default function DeepMindPage() {
  const { result, ask } = useDeepMind();

  return (
    <div>
      <h1>Deep Mind</h1>
      <textarea id="query" placeholder="Ask the system..." />
      <button onClick={() => ask(document.getElementById("query").value)}>
        Send
      </button>

      {result && (
        <div className="result-box">
          <h3>Response</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
