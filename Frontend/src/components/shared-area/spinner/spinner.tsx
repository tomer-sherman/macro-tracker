import "./spinner.css";

// Small indeterminate loader, for a wait with no content shape to preview (lists use Skeleton instead):
export function Spinner() {
    return (
        <div className="Spinner" role="status">

            <span className="spinner-ring" aria-hidden="true" />
            <span className="visually-hidden">Loading...</span>

        </div>
    );
}
