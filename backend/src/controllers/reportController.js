import * as reportService from '../services/reportService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getDashboardSummary(req.user.id);
    res.status(200).json({ status: 'success', data: summary });
  } catch (error) {
    next(error);
  }
};

export const getSpendingByCategory = async (req, res, next) => {
  try {
    const spending = await reportService.getSpendingByCategory(req.user.id);
    res.status(200).json({ status: 'success', data: spending });
  } catch (error) {
    next(error);
  }
};
