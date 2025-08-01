import {
    getQuestionFromUserId,
    sendSurveyForm,
    fetchSurvayData,
    getBidInfo,
    fetchNameAgainstId,
    fetchSurvayDataAgainstObjectId,
    getDashboardStatsOfUser
} from "../controllers/SurvayForm";

export default async function handler(req, res) {

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'POST' && action === 'getQuestionFromUserId') {
            return await getQuestionFromUserId(req, res);
        } else if (req.method === 'POST' && action === 'sendSurveyForm') {
            return await sendSurveyForm(req, res);
        } else if (req.method === 'GET' && action === 'fetchSurvayData') {
            return await fetchSurvayData(req, res);
        } else if (req.method === 'POST' && action === 'getBidInfo') {
            return await getBidInfo(req, res);
        } else if (req.method === 'POST' && action === 'fetchNameAgainstId') {
            return await fetchNameAgainstId(req, res);
        } else if (req.method === 'POST' && action === 'fetchSurvayDataAgainstObjectId') {
            return await fetchSurvayDataAgainstObjectId(req, res);
        } else if (req.method === 'POST' && action === 'getDashboardStatsOfUser') {
            return await getDashboardStatsOfUser(req, res);
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
