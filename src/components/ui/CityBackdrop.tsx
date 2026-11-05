import './CityBackdrop.css';

/** Decorative only: never consumes gameplay RNG or intercepts targeting. */
export function CityBackdrop() {
    return <div className="city-backdrop" aria-hidden="true">
        <div className="city-backdrop-art" />
        <div className="city-backdrop-light" />
        <div className="city-backdrop-shade" />
    </div>;
}
