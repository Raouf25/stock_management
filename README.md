# 📦 Stock Management System

Professional inventory management system with REST API, built with Spring Boot 3.3.3, Angular, and PostgreSQL.

## 🚀 Quick Start

1. **Read Documentation**: See [doc/README.md](doc/README.md)
2. **Setup**: Follow [doc/STARTUP_GUIDE.md](doc/STARTUP_GUIDE.md)
3. **Deploy**: Use [doc/DOCKER_SETUP.md](doc/DOCKER_SETUP.md)

## 📚 Documentation

All documentation is in the `doc/` folder:

| Document | Purpose |
|----------|---------|
| [README.md](doc/README.md) | Project overview & features |
| [STARTUP_GUIDE.md](doc/STARTUP_GUIDE.md) | Getting started (5 steps) |
| [DOCKER_SETUP.md](doc/DOCKER_SETUP.md) | Docker Compose deployment |
| [API_DOCUMENTATION.md](doc/API_DOCUMENTATION.md) | REST API reference |
| [API_EXAMPLES.md](doc/API_EXAMPLES.md) | curl examples & workflows |
| [IMPLEMENTATION_GUIDE.md](doc/IMPLEMENTATION_GUIDE.md) | Architecture & patterns |
| [TESTING_GUIDE.md](doc/TESTING_GUIDE.md) | Unit & integration testing |
| [TROUBLESHOOTING_GUIDE.md](doc/TROUBLESHOOTING_GUIDE.md) | Error resolution |
| [DEPLOYMENT_GUIDE.md](doc/DEPLOYMENT_GUIDE.md) | Production deployment |
| [DOCUMENTATION_INDEX.md](doc/DOCUMENTATION_INDEX.md) | Full navigation guide |

## 🎯 Features

✅ Complete stock management (purchases, sales, inventory)  
✅ REST API with 30+ endpoints  
✅ Real-time stock validation  
✅ Invoice generation (PDF)  
✅ KPI reporting  
✅ Transaction safety  
✅ Clock abstraction for testability  

## 🛠️ Tech Stack

- **Backend**: Spring Boot 3.3.3, Java 21, PostgreSQL 15
- **Frontend**: Angular 17, TypeScript
- **Deployment**: Docker, Docker Compose
- **Testing**: JUnit 5, Mockito

## 📋 Project Structure

```
stock_management/
├── doc/                    # 📚 All documentation
│   ├── README.md
│   ├── STARTUP_GUIDE.md
│   ├── API_DOCUMENTATION.md
│   └── ... (10+ guides)
├── backend/               # Spring Boot API
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/              # Angular app
│   ├── src/app/
│   ├── src/styles/
│   └── package.json
├── docker-compose.yml     # Multi-service setup
└── Dockerfile            # Backend container
```

## 🚀 Get Started

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d --build
```
- Backend: http://localhost:8080/api
- Frontend: http://localhost:4200
- Swagger: http://localhost:8080/swagger-ui.html

### Option 2: Local Development
```bash
cd backend && mvn spring-boot:run
# In another terminal
cd frontend && npm start
```

## 📖 Documentation Highlights

### For Backend Developers
→ Read: [IMPLEMENTATION_GUIDE.md](doc/IMPLEMENTATION_GUIDE.md)  
→ Test: [TESTING_GUIDE.md](doc/TESTING_GUIDE.md)  

### For API Consumers
→ Reference: [API_DOCUMENTATION.md](doc/API_DOCUMENTATION.md)  
→ Try: [API_EXAMPLES.md](doc/API_EXAMPLES.md)  

### For DevOps
→ Setup: [DOCKER_SETUP.md](doc/DOCKER_SETUP.md)  
→ Deploy: [DEPLOYMENT_GUIDE.md](doc/DEPLOYMENT_GUIDE.md)  

### Troubleshooting
→ Issues: [TROUBLESHOOTING_GUIDE.md](doc/TROUBLESHOOTING_GUIDE.md)  

### Full Navigation
→ Guide: [DOCUMENTATION_INDEX.md](doc/DOCUMENTATION_INDEX.md)  

## ✨ Key Design Patterns

- **3-Layer Architecture**: Controllers → Services → Repositories
- **Dependency Injection**: Spring manages all beans
- **Clock Abstraction**: Testable time handling
- **Business Validation**: Service-layer checks
- **Transaction Safety**: Atomic operations
- **BigDecimal**: Precise financial calculations
- **DTO Pattern**: API contracts

## 📊 API Overview

### Endpoints by Category

**Products**: Create, list, search products  
**Purchases**: Record supplier purchases  
**Sales**: Track customer sales  
**Stock**: View inventory & movements  
**Bills**: Generate invoices  
**Reporting**: KPIs & analytics  

See [API_DOCUMENTATION.md](doc/API_DOCUMENTATION.md) for complete reference.

## 🧪 Testing

```bash
cd backend
mvn test                  # Run all tests
mvn test -Dtest=BillServiceTest  # Run specific test
mvn jacoco:report         # Coverage report
```

## 🐛 Troubleshooting

**Common Issues?** → [TROUBLESHOOTING_GUIDE.md](doc/TROUBLESHOOTING_GUIDE.md)  
**Setup Issues?** → [STARTUP_GUIDE.md](doc/STARTUP_GUIDE.md)  
**API Issues?** → [API_DOCUMENTATION.md](doc/API_DOCUMENTATION.md)  

## 📞 Need Help?

1. **Read** the relevant documentation in `doc/` folder
2. **Check** [DOCUMENTATION_INDEX.md](doc/DOCUMENTATION_INDEX.md) for navigation
3. **Search** [TROUBLESHOOTING_GUIDE.md](doc/TROUBLESHOOTING_GUIDE.md)

## 📦 Deployment

**Development**: Follow [STARTUP_GUIDE.md](doc/STARTUP_GUIDE.md)  
**Docker**: Follow [DOCKER_SETUP.md](doc/DOCKER_SETUP.md)  
**Production**: Follow [DEPLOYMENT_GUIDE.md](doc/DEPLOYMENT_GUIDE.md)  

## 🎓 Learning Resources

**New to project?**
1. Start: [doc/README.md](doc/README.md)
2. Setup: [doc/STARTUP_GUIDE.md](doc/STARTUP_GUIDE.md)
3. Learn: [doc/IMPLEMENTATION_GUIDE.md](doc/IMPLEMENTATION_GUIDE.md)

## 📄 License

MIT - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Read documentation
2. Follow code patterns in [IMPLEMENTATION_GUIDE.md](doc/IMPLEMENTATION_GUIDE.md)
3. Add tests as per [TESTING_GUIDE.md](doc/TESTING_GUIDE.md)
4. Update docs if needed

---

**Status**: ✅ Production Ready  
**Documentation**: ✅ Complete (12 comprehensive guides)  
**Last Updated**: April 13, 2026  
**Framework**: Spring Boot 3.3.3, Angular 17

