function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404</h1>
      <p>sorry, the page you are looking for does not exist.</p>
      <p>
        please check the URL or navigate back to
        <a href="/search" style={{ marginLeft: "5px" }}>
          search
        </a>
        .
      </p>
    </div>
  );
}

export default NotFound;
