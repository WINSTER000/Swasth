import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ShieldAlert, CheckCircle, Edit3, XCircle, AlertTriangle } from 'lucide-react';

export const AIRiskAssessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await axios.get('/api/risk-assessments/high-risk');
      setAssessments(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, decision, level) => {
    try {
      await axios.patch(`/api/risk-assessments/${id}/review`, {
        decision,
        finalRiskLevel: level,
      });
      alert(`Risk Assessment review updated (${decision})!`);
      fetchAssessments();
    } catch (e) {
      alert('Failed to submit review');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading risk assessments...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Risk Detection & Early Warning Review</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Professional health-worker review workflow for AI-detected high-risk clinical profiles.
        </p>
      </div>

      <div className="space-y-4">
        {assessments.length === 0 ? (
          <Card className="text-center py-8 text-xs text-slate-500">No high-risk patient assessments awaiting review.</Card>
        ) : (
          assessments.map((item) => (
            <Card key={item._id}>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.finalRiskLevel === 'CRITICAL' ? 'danger' : 'warning'}>
                      AI Risk Level: {item.aiRiskLevel}
                    </Badge>
                    <Badge variant="neutral">Confidence: {Math.round(item.aiConfidence * 100)}%</Badge>
                  </div>
                  <span className="font-bold text-slate-500">Decision: {item.healthWorkerDecision}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Patient: {item.patient?.name}</h4>
                  <p className="text-slate-600 dark:text-slate-300 font-medium mt-1">Recommended Action: {item.recommendedAction}</p>
                  
                  <div className="mt-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Risk Factors:</span>
                    <ul className="list-disc pl-4 text-slate-500 mt-0.5 space-y-0.5">
                      {item.riskFactors?.map((rf, i) => <li key={i}>{rf}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Worker Review Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    size="sm"
                    variant="success"
                    icon={CheckCircle}
                    onClick={() => handleReview(item._id, 'ACCEPT', item.aiRiskLevel)}
                  >
                    ACCEPT AI Risk Level
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    icon={Edit3}
                    onClick={() => handleReview(item._id, 'MODIFY', 'MEDIUM')}
                  >
                    MODIFY to Medium
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    icon={XCircle}
                    onClick={() => handleReview(item._id, 'REJECT', 'LOW')}
                  >
                    REJECT Assessment
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
