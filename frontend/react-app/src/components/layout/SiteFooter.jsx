import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="footer bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h4 className="fw-bold mb-3">
              <i className="fas fa-graduation-cap me-2" />EduLearn
            </h4>
            <p className="text-light">
              World's leading platform for online learning and skill development.
            </p>
            <div className="social-icons mt-4">
              <a href="#" className="text-white me-3" aria-label="Facebook">
                <i className="fab fa-facebook fa-lg" />
              </a>
              <a href="#" className="text-white me-3" aria-label="Twitter">
                <i className="fab fa-twitter fa-lg" />
              </a>
              <a href="#" className="text-white me-3" aria-label="LinkedIn">
                <i className="fab fa-linkedin fa-lg" />
              </a>
              <a href="#" className="text-white" aria-label="YouTube">
                <i className="fab fa-youtube fa-lg" />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Platform</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/courses" className="text-light text-decoration-none">
                  Browse Courses
                </Link>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  Become Instructor
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  For Business
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Affiliate Program
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  FAQ
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Community
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Subscribe to Newsletter</h5>
            <p className="text-light">Get weekly updates on new courses and learning tips.</p>
            <div className="input-group mb-3">
              <input type="email" className="form-control" placeholder="Your email address" />
              <button className="btn btn-primary" type="button">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <hr className="bg-light" />

        <div className="row pt-3">
          <div className="col-md-6">
            <p className="mb-0">Copyright 2026 EduLearn. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <a href="#" className="text-light text-decoration-none me-3">
              Privacy Policy
            </a>
            <a href="#" className="text-light text-decoration-none">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
