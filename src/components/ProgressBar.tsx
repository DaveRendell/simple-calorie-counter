import "./ProgressBar.css";

export function ProgressBar({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target && target > 0;

  return (
    <div className="progress-container">
      {target > 0 && (
        <div
          className={`progress-remaining ${over ? "progress-over-text" : ""}`}
        >
          {over ? `${current - target} over` : `${target - current} remaining`}
        </div>
      )}
      <div className="progress-bar">
        <div
          className={`progress-fill ${over ? "progress-over" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="progress-text">
        <span className={over ? "progress-over-text" : ""}>{current}</span>
        {" / "}
        {target} cal
      </div>
    </div>
  );
}
