export default function Terms() {
  return (
    <div className="container mt-4" style={{maxWidth: 800}}>
      <div className="card shadow">
        <div className="card-header py-3">
          <h5 className="m-0 fw-bold text-primary">Terms and Conditions</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">Last updated: Dec 8, 2025</p>
          <h6>1. Acceptance of Terms</h6>
          <p>By creating an account and using this application, you agree to these Terms and Conditions.</p>
          <h6>2. User Responsibilities</h6>
          <p>You are responsible for the accuracy of your account information and for maintaining the confidentiality of your credentials.</p>
          <h6>3. Privacy</h6>
          <p>We process your data in accordance with our privacy practices. Do not submit sensitive information unless required.</p>
          <h6>4. Prohibited Use</h6>
          <p>Do not misuse the service, attempt to breach security, or violate applicable laws.</p>
          <h6>5. Changes</h6>
          <p>We may update these terms from time to time. Continued use constitutes acceptance of the updated terms.</p>
          <div className="mt-3">
            <a className="btn btn-outline-primary" href="/register">Back to Register</a>
          </div>
        </div>
      </div>
    </div>
  )
}
