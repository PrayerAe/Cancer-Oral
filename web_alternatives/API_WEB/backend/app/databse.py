"""
Database Models and Session Management
Optional database integration for storing analysis history
"""

import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
import sqlite3
import asyncio
import logging

logger = logging.getLogger(__name__)

class SimpleAnalysisDB:
    """Simple SQLite database for storing analysis history"""
    
    def __init__(self, db_path: str = "data/analysis_history.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.init_db()
    
    def init_db(self):
        """Initialize database tables"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS analysis_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        request_id TEXT UNIQUE NOT NULL,
                        prediction TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        processing_time REAL NOT NULL,
                        patient_data TEXT,
                        analysis_date TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_request_id 
                    ON analysis_history(request_id)
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_analysis_date 
                    ON analysis_history(analysis_date)
                """)
                
                conn.commit()
                logger.info("✅ Database initialized successfully")
                
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
    
    async def save_analysis(self, analysis_data: Dict[str, Any]) -> bool:
        """Save analysis result to database"""
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._save_analysis_sync, analysis_data)
            
        except Exception as e:
            logger.error(f"❌ Failed to save analysis: {e}")
            return False
    
    def _save_analysis_sync(self, analysis_data: Dict[str, Any]) -> bool:
        """Synchronous save operation"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO analysis_history 
                    (request_id, prediction, confidence, processing_time, 
                     patient_data, analysis_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    analysis_data.get('request_id'),
                    analysis_data.get('prediction'),
                    analysis_data.get('confidence'),
                    analysis_data.get('processing_time'),
                    json.dumps(analysis_data.get('patient_data', {})),
                    analysis_data.get('analysis_date')
                ))
                conn.commit()
                return True
                
        except Exception as e:
            logger.error(f"❌ Database save error: {e}")
            return False
    
    async def get_analysis_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent analysis history"""
        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._get_history_sync, limit)
            
        except Exception as e:
            logger.error(f"❌ Failed to get history: {e}")
            return []
    
    def _get_history_sync(self, limit: int) -> List[Dict[str, Any]]:
        """Synchronous get history operation"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT * FROM analysis_history 
                    ORDER BY created_at DESC 
                    LIMIT ?
                """, (limit,))
                
                results = []
                for row in cursor.fetchall():
                    result = dict(row)
                    # Parse patient_data JSON
                    if result['patient_data']:
                        result['patient_data'] = json.loads(result['patient_data'])
                    results.append(result)
                
                return results
                
        except Exception as e:
            logger.error(f"❌ Database read error: {e}")
            return []
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get analysis statistics"""
        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._get_stats_sync)
            
        except Exception as e:
            logger.error(f"❌ Failed to get statistics: {e}")
            return {}
    
    def _get_stats_sync(self) -> Dict[str, Any]:
        """Synchronous get statistics operation"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Total analyses
                total_cursor = conn.execute("SELECT COUNT(*) FROM analysis_history")
                total_analyses = total_cursor.fetchone()[0]
                
                # Cancer vs Non-Cancer distribution
                dist_cursor = conn.execute("""
                    SELECT prediction, COUNT(*) as count 
                    FROM analysis_history 
                    GROUP BY prediction
                """)
                distribution = {row[0]: row[1] for row in dist_cursor.fetchall()}
                
                # Average confidence
                conf_cursor = conn.execute("SELECT AVG(confidence) FROM analysis_history")
                avg_confidence = conf_cursor.fetchone()[0] or 0
                
                # Average processing time
                time_cursor = conn.execute("SELECT AVG(processing_time) FROM analysis_history")
                avg_processing_time = time_cursor.fetchone()[0] or 0
                
                # Recent activity (last 7 days)
                recent_cursor = conn.execute("""
                    SELECT COUNT(*) FROM analysis_history 
                    WHERE analysis_date >= date('now', '-7 days')
                """)
                recent_activity = recent_cursor.fetchone()[0]
                
                return {
                    "total_analyses": total_analyses,
                    "distribution": distribution,
                    "avg_confidence": round(avg_confidence, 2),
                    "avg_processing_time": round(avg_processing_time, 3),
                    "recent_activity_7days": recent_activity
                }
                
        except Exception as e:
            logger.error(f"❌ Statistics error: {e}")
            return {}

# Global database instance (optional)
analysis_db = SimpleAnalysisDB() if os.getenv("ENABLE_DATABASE", "false").lower() == "true" else None
