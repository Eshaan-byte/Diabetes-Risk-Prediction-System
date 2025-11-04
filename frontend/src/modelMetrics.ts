export const modelMetrics = {
  logisticregression: {
    accuracy: 73.4,
    f1: 66.1,
    recall: 74.1,
    rocAuc: 82.8,
  },
  randomforest: {
    accuracy: 88.3,
    f1: 83.6,
    recall: 85.2,
    rocAuc: 94.9,
  },
  svc: {
    accuracy: 83.1,
    f1: 77.6,
    recall: 83.3,
    rocAuc: 88.3,
  },
  knn: {
    accuracy: 75.3,
    f1: 69.4,
    recall: 79.6,
    rocAuc: 84.5,
  },
  mlp: {
    accuracy: 84.4,
    f1: 78.2,
    recall: 79.6,
    rocAuc: 88.2,
  },
  xgboost: {
    accuracy: 90.9,
    f1: 87.3,
    recall: 88.9,
    rocAuc: 95.9,
  },
} as const;
