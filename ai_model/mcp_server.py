#!/usr/bin/env python3
"""
MCP Server for AI Fitness Assessment Model

Exposes the fitness prediction model as an MCP tool that can be used by Claude
and other AI applications to perform fitness assessments.
"""

import subprocess
import sys
import json
from typing import Any
import asyncio

# Check if mcp package is installed, if not, provide installation instructions
try:
    from mcp.server.models import InitializationOptions
    from mcp.types import Tool, TextContent, ToolResult
    from mcp.server import Server
except ImportError:
    print("MCP library not installed. Please run: pip install mcp")
    sys.exit(1)

import requests


class FitnessAssessmentServer:
    """MCP Server for Fitness Assessment Model"""
    
    def __init__(self, ai_server_url: str = "http://127.0.0.1:5001"):
        self.ai_server_url = ai_server_url
        self.server = Server("fitness-assessment-mcp")
        self.setup_tools()
        
    def setup_tools(self):
        """Register tools with the MCP server"""
        
        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            """List available tools"""
            return [
                Tool(
                    name="assess_fitness",
                    description="Assess worker fitness for labour based on health data. Returns fitness status and contributing factors.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "age": {
                                "type": "number",
                                "description": "Age in years (must be >= 18)"
                            },
                            "gender": {
                                "type": "string",
                                "enum": ["Male", "Female"],
                                "description": "Gender (Male or Female)"
                            },
                            "work_types": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Types of work (e.g., ['general_labour', 'construction'])"
                            },
                            "asthma": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has asthma?"
                            },
                            "knee_pain": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has knee pain?"
                            },
                            "leg_injury": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has leg injury?"
                            },
                            "hand_injury": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has hand injury?"
                            },
                            "chest_pain": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has chest pain?"
                            },
                            "heart_issue": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has heart issue?"
                            },
                            "smoking": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Smokes?"
                            },
                            "alcohol": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Drinks alcohol?"
                            },
                            "kidney_issue": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has kidney issue?"
                            },
                            "headache_issue": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has headache issues?"
                            },
                            "eyesight_issue": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "Has eyesight issues?"
                            },
                            "appendicitis_history": {
                                "type": "string",
                                "enum": ["Yes", "No"],
                                "description": "History of appendicitis?"
                            }
                        },
                        "required": ["age", "work_types"]
                    }
                ),
                Tool(
                    name="get_model_status",
                    description="Get the current status of the fitness assessment model",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                )
            ]
        
        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> list[TextContent | ToolResult]:
            """Handle tool calls"""
            
            if name == "assess_fitness":
                return await self._assess_fitness(arguments)
            elif name == "get_model_status":
                return await self._get_model_status()
            else:
                return [TextContent(type="text", text=f"Unknown tool: {name}")]
    
    async def _assess_fitness(self, params: dict) -> list[TextContent]:
        """Call the fitness assessment API"""
        try:
            response = requests.post(
                f"{self.ai_server_url}/api/predict",
                json=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                result = f"""
**Fitness Assessment Result**

📊 **Status**: {data.get('fitness_status', 'Unknown')}
📈 **Confidence**: {data.get('confidence', '0.00')}

**Contributing Factors**:
"""
                for contrib in data.get('contributions', []):
                    result += f"\n- {contrib.get('label', 'Unknown')}: {contrib.get('value', 0):.2f}"
                
                return [TextContent(type="text", text=result)]
            else:
                error_msg = response.json().get('error', 'Unknown error')
                return [TextContent(type="text", text=f"❌ Assessment failed: {error_msg}")]
                
        except requests.exceptions.ConnectionError:
            return [TextContent(type="text", text="❌ Could not connect to AI server. Make sure it's running on http://127.0.0.1:5001")]
        except Exception as e:
            return [TextContent(type="text", text=f"❌ Error: {str(e)}")]
    
    async def _get_model_status(self) -> list[TextContent]:
        """Get model status from AI server"""
        try:
            response = requests.get(
                f"{self.ai_server_url}/api/status",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                status = f"""
**Model Status**

Status: {data.get('status', 'unknown')}
Features: {data.get('model_features', 'N/A')}

Available Endpoints:
"""
                for endpoint in data.get('available_endpoints', []):
                    status += f"\n- {endpoint}"
                
                return [TextContent(type="text", text=status)]
            else:
                return [TextContent(type="text", text="❌ Model not ready")]
                
        except requests.exceptions.ConnectionError:
            return [TextContent(type="text", text="❌ Could not connect to AI server")]
        except Exception as e:
            return [TextContent(type="text", text=f"❌ Error: {str(e)}")]
    
    async def run(self):
        """Run the MCP server"""
        async with self.server:
            print("🚀 Fitness Assessment MCP Server running")
            print(f"📡 Connected to AI server: {self.ai_server_url}")
            await self.server.wait_for_exit()


async def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Fitness Assessment MCP Server")
    parser.add_argument(
        "--ai-server",
        default="http://127.0.0.1:5001",
        help="URL of the AI fitness server (default: http://127.0.0.1:5001)"
    )
    
    args = parser.parse_args()
    
    server = FitnessAssessmentServer(ai_server_url=args.ai_server)
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())
