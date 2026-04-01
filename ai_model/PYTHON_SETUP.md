# Python Environment Setup for AI Fitness Model

## Problem
Python 3.14 is too new - pandas doesn't have pre-built wheels for it yet, causing compilation errors.

## Solution: Create Virtual Environment with Python 3.12

### Step 1: Install Python 3.12

Download from: https://www.python.org/downloads/release/python-3129/

Choose: **Windows installer (64-bit)**

During installation:
- ✅ Check "Add Python 3.12 to PATH"
- ✅ Check "Install pip"
- Click "Install Now"

Or use Windows Package Manager:
```powershell
winget install Python.Python.3.12
```

### Step 2: Create Virtual Environment in ai_model folder

```powershell
cd c:\Digital_health_record_labour_fitness_assessment\ai_model

# Create venv with Python 3.12
python3.12 -m venv venv

# Activate venv
.\venv\Scripts\Activate.ps1

# Verify Python version (should be 3.12.x)
python --version
```

### Step 3: Install Requirements

```powershell
# Upgrade pip first
python -m pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

### Step 4: Run the AI Server

```powershell
# Make sure venv is activated
python ai_server.py
```

### Quick Reference

**Activate venv:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Deactivate venv:**
```powershell
deactivate
```

**Check Python version:**
```powershell
python --version
```

## Alternative: Quick Fix without Uninstalling Python 3.14

If you want to keep Python 3.14 and use Python 3.12 just for this project:

```powershell
# Install Python 3.12 from Windows Store
# Then use:
python3.12 -m venv venv_3_12
.\venv_3_12\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Troubleshooting

### "python3.12: command not found"
- Python 3.12 not installed
- Solution: Download and install from python.org

### "venv not recognized"
- Use full path: `C:\Python312\python.exe -m venv venv`

### Still getting pandas errors
- Delete venv folder: `Remove-Item venv -Recurse`
- Create new one: `python3.12 -m venv venv`
- Reinstall: `pip install -r requirements.txt`

## Python Version Compatibility

| Component | Python 3.12 | Python 3.14 |
|-----------|------------|-----------|
| Flask | ✅ Yes | ❌ No wheels |
| Pandas | ✅ Yes | ⏳ Building |
| Scikit-learn | ✅ Yes | ❌ No wheels |
| Joblib | ✅ Yes | ✅ Yes |
| MCP | ✅ Yes | ⏳ Building |

**Recommendation:** Use Python 3.12 for stability ✅
