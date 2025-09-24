# 🚀 Quick Start Guide for Development Teams

## 📋 **Getting Started**

### **Prerequisites**
- Node.js v22.19.0+ (already installed)
- Git (for version control)
- Code editor (VS Code recommended)
- Terminal access

### **Initial Setup**
```bash
# Clone the repository
git clone [repository-url]
cd mood-board-generator

# Install dependencies
npm install

# Start development server
npm start
```

## 🔧 **Development Commands**

### **Quality Gates (Run Frequently)**
```bash
# TypeScript validation
npm run type-check

# Code style check
npm run lint

# Run all tests
npm test

# Complete quality check
npm run pre-cycle-complete
```

### **Development Workflow**
```bash
# Start a new cycle
git checkout main && git pull
git checkout -b feature/cycle-XXX-description

# During development (run frequently)
npm run type-check && npm test && npm run lint

# Before committing
npm run pre-cycle-complete

# Commit and push
git add . && git commit -m "feat: Complete Cycle XXX - Description"
git push
```

## 📁 **Project Structure**

```
mood-board-generator/
├── docs/
│   ├── cycles/
│   │   ├── active/           # Current work (1-2 cycles max)
│   │   ├── backlog/          # Planned work
│   │   ├── completed/        # Finished cycles
│   │   ├── ready-for-qa/     # Awaiting QA review
│   │   └── needs-fixes/      # Failed QA with feedback
│   ├── project-management.md
│   ├── team-assignments.md
│   └── automated-plan.md
├── src/
│   ├── components/           # React components
│   ├── services/            # Business logic
│   ├── types/               # TypeScript interfaces
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Helper functions
├── tests/                   # Test files
└── scripts/                # Utility scripts
```

## 🎯 **Cycle Management**

### **Starting a Cycle**
1. **Move to Active**: `mv docs/cycles/backlog/XXX_cycle.md docs/cycles/active/`
2. **Update Status**: Change "BACKLOG" to "ACTIVE" in cycle file
3. **Create Branch**: `git checkout -b feature/cycle-XXX-description`
4. **Begin Work**: Follow acceptance criteria in cycle file

### **During Development**
- **Run Quality Checks**: After every few changes
- **Update Progress**: Add notes to cycle file
- **Request Reviews**: For complex changes
- **Test Frequently**: Ensure all tests pass

### **Completing a Cycle**
1. **Final Quality Check**: `npm run pre-cycle-complete`
2. **Move to QA**: `mv docs/cycles/active/XXX_cycle.md docs/cycles/ready-for-qa/`
3. **Create PR**: Merge to main branch
4. **Notify QA**: Cycle ready for review

## 🧪 **QA Process**

### **Receiving a Cycle**
1. **Move from Ready-for-QA**: `mv docs/cycles/ready-for-qa/XXX_cycle.md docs/cycles/active/`
2. **Review Acceptance Criteria**: Verify all requirements
3. **Run Test Suite**: Comprehensive testing
4. **Validate Quality**: Performance, security, usability

### **QA Decision**
- **PASS**: Move to `docs/cycles/completed/`
- **FAIL**: Move to `docs/cycles/needs-fixes/` with detailed feedback

## 📊 **Quality Standards**

### **Zero Tolerance Rules**
- ❌ **NO** TypeScript errors (`any` type forbidden)
- ❌ **NO** lint warnings
- ❌ **NO** failing tests
- ❌ **NO** console errors
- ❌ **NO** commented-out code

### **Required Standards**
- ✅ **ALL** functions have return types
- ✅ **ALL** new code has tests
- ✅ **ALL** components are accessible
- ✅ **ALL** APIs have error handling
- ✅ **ALL** performance targets met

## 🚨 **Emergency Procedures**

### **If Quality Gates Fail**
```bash
# Emergency recovery
git checkout -- src/           # Revert all changes
npm run type-check            # Verify recovery
npm test                      # Confirm tests pass
```

### **If Tests Break**
1. **Don't Panic**: Check what changed
2. **Run Individual Tests**: `npm test -- --testNamePattern="test name"`
3. **Check Dependencies**: Ensure all packages installed
4. **Ask for Help**: Don't spend more than 30 minutes debugging

## 📞 **Getting Help**

### **Technical Issues**
- **Team Lead**: Architecture and design decisions
- **Code Reviews**: Peer review for complex changes
- **Documentation**: Check cycle files and project docs

### **Process Questions**
- **Project Management**: Check `docs/project-management.md`
- **Team Assignments**: Check `docs/team-assignments.md`
- **Cycle Details**: Check individual cycle files

## 🎯 **Success Tips**

### **Development Best Practices**
1. **Small Commits**: Commit frequently with clear messages
2. **Test Early**: Write tests as you develop
3. **Quality First**: Run quality gates constantly
4. **Document Changes**: Update cycle notes regularly
5. **Ask Questions**: Better to ask than assume

### **QA Best Practices**
1. **Test Thoroughly**: Don't rush through acceptance criteria
2. **Document Issues**: Provide clear, actionable feedback
3. **Validate Performance**: Check load times and responsiveness
4. **Security First**: Always validate security requirements
5. **User Focus**: Think like an end user

## 📅 **Daily Schedule**

### **Morning (9:00 AM)**
- **Standup Meeting**: Progress updates and blockers
- **Review Active Cycles**: Check status and priorities
- **Plan Day**: Focus on current cycle work

### **During Development**
- **Quality Checks**: Run after every few changes
- **Code Reviews**: Request reviews for complex changes
- **Testing**: Ensure all tests pass continuously

### **End of Day**
- **Update Progress**: Add notes to cycle files
- **Commit Work**: Save progress with clear messages
- **Plan Tomorrow**: Review next day priorities

---

**This quick start guide ensures all team members can contribute effectively to the mood board generator project following the Adbox methodology.**




