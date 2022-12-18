import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up({context}: {context: QueryInterface}) {
  await context.addColumn('QuizStep', 'scoringAlgorithm', {
    type: DataTypes.ENUM('default', 'strict'),
      allowNull: true,
  }); 
}

export async function down({context}: {context: QueryInterface}) {
  await context.removeColumn('QuizStep', 'scoringAlgorithm');
}
