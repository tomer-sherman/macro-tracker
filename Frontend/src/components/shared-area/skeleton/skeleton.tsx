import "./skeleton.css";

type SkeletonProps = {
    rows?: number;
    label?: string; // Announced to screen readers.
};

// Loading placeholder shaped like log rows, with a shimmer (static under reduced motion):
export function Skeleton({ rows = 3, label = "Loading..." }: SkeletonProps) {
    return (
        <div className="Skeleton" role="status">

            <span className="visually-hidden">{label}</span>

            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="skeleton-row" aria-hidden="true">
                    <span className="skeleton-line skeleton-time" />
                    <span className="skeleton-line skeleton-text" />
                    <span className="skeleton-block" />
                </div>
            ))}

        </div>
    );
}
