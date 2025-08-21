<template>
  <div class="model-training">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>NLP模型训练管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 创建训练任务
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalTasks || 0 }}</div>
              <div class="stat-label">总任务数</div>
            </div>
            <i class="el-icon-data-analysis stat-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card running">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.runningTasks || 0 }}</div>
              <div class="stat-label">运行中</div>
            </div>
            <i class="el-icon-loading stat-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card completed">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.completedTasks || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <i class="el-icon-success stat-icon"></i>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card failed">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.failedTasks || 0 }}</div>
              <div class="stat-label">失败</div>
            </div>
            <i class="el-icon-error stat-icon"></i>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 180px">
            <el-option label="全部" value=""></el-option>
            <el-option label="待开始" value="pending"></el-option>
            <el-option label="训练中" value="training"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="失败" value="failed"></el-option>
            <el-option label="已停止" value="stopped"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模型类型">
          <el-select v-model="searchForm.modelType" placeholder="选择模型类型" clearable style="width: 200px">
            <el-option label="全部" value=""></el-option>
            <el-option 
              v-for="type in modelTypes" 
              :key="type.id" 
              :label="type.name" 
              :value="type.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTrainingTasks">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 训练任务列表 -->
    <el-card class="table-card">
      <el-table 
        :data="trainingTasks" 
        v-loading="loading" 
        style="width: 100%"
        @row-click="viewTaskDetail">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="任务名称" min-width="200"></el-table-column>
        <el-table-column prop="modelType" label="模型类型" width="150">
          <template slot-scope="scope">
            <el-tag size="small">{{ getModelTypeName(scope.row.modelType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)" 
              size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template slot-scope="scope">
            <el-progress 
              :percentage="scope.row.progress || 0" 
              :status="scope.row.status === 'failed' ? 'exception' : (scope.row.progress === 100 ? 'success' : '')">
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="estimatedTime" label="预计时长" width="120"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              type="primary" 
              @click.stop="viewTaskDetail(scope.row)">
              详情
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'" 
              size="mini" 
              type="success" 
              @click.stop="startTraining(scope.row.id)">
              开始
            </el-button>
            <el-button 
              v-if="scope.row.status === 'training'" 
              size="mini" 
              type="warning" 
              @click.stop="stopTraining(scope.row.id)">
              停止
            </el-button>
            <el-button 
              v-if="scope.row.status === 'completed'" 
              size="mini" 
              type="success" 
              @click.stop="showEvaluateDialog(scope.row)">
              评估
            </el-button>
            <el-button 
              v-if="scope.row.status === 'completed'" 
              size="mini" 
              type="primary" 
              @click.stop="showDeployDialog(scope.row)">
              部署
            </el-button>
            <el-button 
              v-if="scope.row.status === 'completed'" 
              size="mini" 
              type="info" 
              @click.stop="exportModel(scope.row.id)">
              导出
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 创建训练任务对话框 -->
    <el-dialog 
      title="创建训练任务" 
      :visible.sync="showCreateDialog" 
      width="600px" 
      @close="resetCreateForm">
      <el-form 
        :model="createForm" 
        :rules="createRules" 
        ref="createForm" 
        label-width="120px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="模型类型" prop="modelType">
          <el-select v-model="createForm.modelType" placeholder="选择模型类型" style="width: 100%">
            <el-option 
              v-for="type in modelTypes" 
              :key="type.id" 
              :label="type.name" 
              :value="type.id">
              <span style="float: left">{{ type.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ type.description }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据集" prop="datasetId">
          <el-select v-model="createForm.datasetId" placeholder="选择数据集" style="width: 100%">
            <el-option 
              v-for="dataset in datasets" 
              :key="dataset.id" 
              :label="dataset.name" 
              :value="dataset.id">
              <span style="float: left">{{ dataset.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ dataset.size }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="训练轮数" prop="epochs">
          <el-input-number v-model="createForm.epochs" :min="1" :max="100" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="批次大小" prop="batchSize">
          <el-input-number v-model="createForm.batchSize" :min="1" :max="512" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="学习率" prop="learningRate">
          <el-input-number v-model="createForm.learningRate" :min="0.0001" :max="1" :step="0.0001" :precision="4" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            type="textarea" 
            v-model="createForm.description" 
            placeholder="请输入任务描述" 
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTrainingTask" :loading="creating">创建</el-button>
      </div>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog 
      title="训练任务详情" 
      :visible.sync="showDetailDialog" 
      width="800px">
      <div v-if="currentTask">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
              <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
              <el-descriptions-item label="模型类型">
                <el-tag size="small">{{ getModelTypeName(currentTask.modelType) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(currentTask.status)" size="small">
                  {{ getStatusText(currentTask.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="数据集">{{ currentTask.datasetName }}</el-descriptions-item>
              <el-descriptions-item label="训练轮数">{{ currentTask.epochs }}</el-descriptions-item>
              <el-descriptions-item label="批次大小">{{ currentTask.batchSize }}</el-descriptions-item>
              <el-descriptions-item label="学习率">{{ currentTask.learningRate }}</el-descriptions-item>
              <el-descriptions-item label="当前准确率">{{ (currentTask.accuracy * 100).toFixed(2) }}%</el-descriptions-item>
              <el-descriptions-item label="当前损失">{{ currentTask.loss }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 训练进度 -->
          <el-tab-pane label="训练进度" name="progress">
            <div v-if="trainingProgress">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card>
                    <div slot="header">训练进度</div>
                    <el-progress 
                      type="circle" 
                      :percentage="trainingProgress.progress || 0" 
                      :width="120">
                    </el-progress>
                    <p style="margin-top: 10px; text-align: center;">
                      {{ trainingProgress.currentEpoch || 0 }} / {{ trainingProgress.totalEpochs || 0 }} 轮
                    </p>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card>
                    <div slot="header">性能指标</div>
                    <div class="metrics">
                      <div class="metric-item">
                        <span class="metric-label">当前损失:</span>
                        <span class="metric-value">{{ trainingProgress.currentLoss || 'N/A' }}</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">当前准确率:</span>
                        <span class="metric-value">{{ ((trainingProgress.currentAccuracy || 0) * 100).toFixed(2) }}%</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">预计剩余时间:</span>
                        <span class="metric-value">{{ trainingProgress.estimatedTimeRemaining || 'N/A' }}</span>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <!-- 训练日志 -->
          <el-tab-pane label="训练日志" name="logs">
            <div class="logs-container">
              <el-button 
                type="primary" 
                size="small" 
                @click="loadTrainingLogs" 
                style="margin-bottom: 10px;">
                刷新日志
              </el-button>
              <div class="log-content">
                <div 
                  v-for="log in trainingLogs" 
                  :key="log.timestamp" 
                  class="log-item"
                  :class="log.level.toLowerCase()">
                  <span class="log-timestamp">{{ log.timestamp }}</span>
                  <span class="log-level">{{ log.level }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 模型评估 -->
          <el-tab-pane label="模型评估" name="evaluation" v-if="currentTask && currentTask.status === 'completed'">
            <div v-if="evaluation">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card>
                    <div slot="header">评估指标</div>
                    <div class="evaluation-metrics">
                      <div class="metric-item">
                        <span class="metric-label">准确率 (Accuracy):</span>
                        <span class="metric-value">{{ (evaluation.accuracy * 100).toFixed(2) }}%</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">精确率 (Precision):</span>
                        <span class="metric-value">{{ (evaluation.precision * 100).toFixed(2) }}%</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">召回率 (Recall):</span>
                        <span class="metric-value">{{ (evaluation.recall * 100).toFixed(2) }}%</span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">F1分数:</span>
                        <span class="metric-value">{{ (evaluation.f1Score * 100).toFixed(2) }}%</span>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card>
                    <div slot="header">混淆矩阵</div>
                    <div class="confusion-matrix" v-if="evaluation.confusionMatrix">
                      <table>
                        <tr v-for="(row, i) in evaluation.confusionMatrix" :key="i">
                          <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
                        </tr>
                      </table>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
              <div style="margin-top: 20px; text-align: center;">
                <el-button type="primary" @click="evaluateModel">重新评估</el-button>
              </div>
            </div>
            <div v-else style="text-align: center; padding: 40px;">
              <el-button type="primary" @click="evaluateModel">开始评估</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 数据集管理对话框 -->
    <el-dialog 
      title="数据集管理" 
      :visible.sync="showDatasetDialog" 
      width="800px">
      <div class="dataset-management">
        <div class="dataset-header">
          <el-button type="primary" @click="showUploadDialog = true">
            <i class="el-icon-upload"></i> 上传数据集
          </el-button>
        </div>
        <el-table :data="datasets" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="数据集名称" min-width="200"></el-table-column>
          <el-table-column prop="dataType" label="数据类型" width="150">
            <template slot-scope="scope">
              <el-tag size="small">{{ scope.row.dataType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="数据量" width="120"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag 
                :type="scope.row.status === 'processed' ? 'success' : 'warning'" 
                size="small">
                {{ scope.row.status === 'processed' ? '已处理' : '处理中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button size="mini" type="primary">预处理</el-button>
              <el-button size="mini" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 上传数据集对话框 -->
    <el-dialog 
      title="上传数据集" 
      :visible.sync="showUploadDialog" 
      width="500px">
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadForm" label-width="100px">
        <el-form-item label="数据集名称" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入数据集名称"></el-input>
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="uploadForm.dataType" placeholder="选择数据类型" style="width: 100%">
            <el-option label="文本分类" value="text_classification"></el-option>
            <el-option label="命名实体识别" value="named_entity_recognition"></el-option>
            <el-option label="文本生成" value="text_generation"></el-option>
            <el-option label="问答系统" value="question_answering"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            type="textarea" 
            v-model="uploadForm.description" 
            placeholder="请输入数据集描述" 
            :rows="3">
          </el-input>
        </el-form-item>
        <el-form-item label="文件" prop="file">
          <el-upload
            ref="upload"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            accept=".csv,.json,.txt"
            drag>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传csv/json/txt文件，且不超过50MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="uploadDataset" :loading="uploading">上传</el-button>
      </div>
    </el-dialog>

    <!-- 模型评估对话框 -->
    <el-dialog 
      title="模型评估" 
      :visible.sync="showEvaluateDialog" 
      width="600px">
      <el-form :model="evaluateForm" label-width="120px">
        <el-form-item label="选择测试数据集">
          <el-select v-model="evaluateForm.testDatasetId" placeholder="请选择测试数据集" style="width: 100%">
            <el-option 
              v-for="dataset in datasets" 
              :key="dataset.id" 
              :label="dataset.name" 
              :value="dataset.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if="evaluationResult" class="evaluation-result">
        <h4>评估结果</h4>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="metric-card">
              <div class="metric-value">{{ (evaluationResult.accuracy * 100).toFixed(2) }}%</div>
              <div class="metric-label">准确率</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="metric-card">
              <div class="metric-value">{{ evaluationResult.totalSamples }}</div>
              <div class="metric-label">测试样本数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="metric-card">
              <div class="metric-value">{{ evaluationResult.correctPredictions }}</div>
              <div class="metric-label">正确预测数</div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEvaluateDialog = false">关闭</el-button>
        <el-button type="primary" @click="evaluateModel" :loading="evaluating">开始评估</el-button>
      </div>
    </el-dialog>

    <!-- 模型部署对话框 -->
    <el-dialog 
      title="模型部署" 
      :visible.sync="showDeployDialog" 
      width="500px">
      <el-form :model="deployForm" label-width="100px">
        <el-form-item label="部署名称">
          <el-input v-model="deployForm.deploymentName" placeholder="请输入部署名称"></el-input>
        </el-form-item>
        <el-form-item label="部署类型">
          <el-select v-model="deployForm.deploymentType" placeholder="请选择部署类型" style="width: 100%">
            <el-option label="REST API" value="rest_api"></el-option>
            <el-option label="批处理" value="batch"></el-option>
            <el-option label="实时推理" value="realtime"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if="deploymentResult" class="deployment-result">
        <h4>部署信息</h4>
        <p><strong>部署ID:</strong> {{ deploymentResult.deploymentId }}</p>
        <p><strong>状态:</strong> {{ deploymentResult.status }}</p>
        <p><strong>访问端点:</strong> {{ deploymentResult.endpoint }}</p>
        <p><strong>部署时间:</strong> {{ deploymentResult.deploymentTime }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDeployDialog = false">关闭</el-button>
        <el-button type="primary" @click="deployModel" :loading="deploying">开始部署</el-button>
      </div>
    </el-dialog>

     <!-- 模型导出对话框 -->
     <el-dialog 
       title="模型导出" 
       :visible.sync="exportDialogVisible" 
       width="500px">
       <el-form :model="exportForm" label-width="100px">
         <el-form-item label="导出格式">
           <el-select v-model="exportForm.format" placeholder="请选择导出格式" style="width: 100%">
             <el-option label="ONNX" value="onnx"></el-option>
             <el-option label="TensorFlow" value="tf"></el-option>
             <el-option label="PyTorch" value="pytorch"></el-option>
             <el-option label="JSON" value="json"></el-option>
           </el-select>
         </el-form-item>
       </el-form>
       <div v-if="exportResult" class="export-result">
         <h4>导出信息</h4>
         <p><strong>文件名:</strong> {{ exportResult.filename }}</p>
         <p><strong>格式:</strong> {{ exportResult.format }}</p>
         <p><strong>文件大小:</strong> {{ formatFileSize(exportResult.size) }}</p>
         <p><strong>导出时间:</strong> {{ exportResult.exportTime }}</p>
         <el-button type="success" @click="downloadModel">下载模型</el-button>
       </div>
       <div slot="footer" class="dialog-footer">
         <el-button @click="exportDialogVisible = false">关闭</el-button>
         <el-button type="primary" @click="exportModel" :loading="exporting">开始导出</el-button>
       </div>
     </el-dialog>
    </div>
  </template>

<script>
import { trainingApi } from '@/api/training'

export default {
  name: 'ModelTraining',
  data() {
    return {
      loading: false,
      creating: false,
      uploading: false,
      
      // 统计数据
      statistics: {},
      
      // 搜索表单
      searchForm: {
        status: '',
        modelType: ''
      },
      
      // 训练任务列表
      trainingTasks: [],
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      
      // 模型类型
      modelTypes: [],
      
      // 数据集
      datasets: [],
      
      // 创建任务对话框
      showCreateDialog: false,
      createForm: {
        name: '',
        modelType: '',
        datasetId: null,
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        description: ''
      },
      createRules: {
        name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
        modelType: [{ required: true, message: '请选择模型类型', trigger: 'change' }],
        datasetId: [{ required: true, message: '请选择数据集', trigger: 'change' }],
        epochs: [{ required: true, message: '请输入训练轮数', trigger: 'blur' }],
        batchSize: [{ required: true, message: '请输入批次大小', trigger: 'blur' }],
        learningRate: [{ required: true, message: '请输入学习率', trigger: 'blur' }]
      },
      
      // 任务详情对话框
      showDetailDialog: false,
      currentTask: null,
      activeTab: 'basic',
      trainingProgress: null,
      trainingLogs: [],
      evaluation: null,
      
      // 数据集管理
      showDatasetDialog: false,
      showUploadDialog: false,
      uploadForm: {
        name: '',
        dataType: '',
        description: ''
      },
      uploadRules: {
        name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
        dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }]
      },
      fileList: [],
      
      // 模型评估
      showEvaluateDialog: false,
      evaluating: false,
      evaluateForm: {
        testDatasetId: null
      },
      evaluationResult: null,
      
      // 模型部署
       showDeployDialog: false,
       deploying: false,
       deployForm: {
         deploymentName: '',
         deploymentType: ''
       },
       deploymentResult: null,
       
       // 模型导出
       exportDialogVisible: false,
       exporting: false,
       exportForm: {
         format: ''
       },
       exportResult: null
    }
  },
  
  created() {
    this.init()
  },
  
  methods: {
    async init() {
      await this.loadStatistics()
      await this.loadModelTypes()
      await this.loadDatasets()
      await this.loadTrainingTasks()
    },
    
    // 加载统计数据
    async loadStatistics() {
      try {
        const response = await trainingApi.getStatistics()
        if (response.code === 200) {
          this.statistics = response.data
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },
    
    // 加载模型类型
    async loadModelTypes() {
      try {
        const response = await trainingApi.getSupportedModelTypes()
        if (response.code === 200) {
          this.modelTypes = response.data.types || []
        }
      } catch (error) {
        console.error('加载模型类型失败:', error)
      }
    },
    
    // 加载数据集
    async loadDatasets() {
      try {
        const response = await trainingApi.getDatasets(1, 100)
        if (response.code === 200) {
          this.datasets = response.data.datasets || []
        }
      } catch (error) {
        console.error('加载数据集失败:', error)
      }
    },
    
    // 加载训练任务
    async loadTrainingTasks() {
      this.loading = true
      try {
        const response = await trainingApi.getTrainingTasks(
          this.pagination.page,
          this.pagination.size,
          this.searchForm.status,
          this.searchForm.modelType
        )
        if (response.code === 200) {
          this.trainingTasks = response.data.tasks || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        this.$message.error('加载训练任务失败')
        console.error('加载训练任务失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        status: '',
        modelType: ''
      }
      this.pagination.page = 1
      this.loadTrainingTasks()
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.loadTrainingTasks()
    },
    
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadTrainingTasks()
    },
    
    // 创建训练任务
    createTrainingTask() {
      this.$refs.createForm.validate(async (valid) => {
        if (valid) {
          this.creating = true
          try {
            const response = await trainingApi.createTrainingTask(this.createForm)
            if (response.code === 200) {
              this.$message.success('创建训练任务成功')
              this.showCreateDialog = false
              this.loadTrainingTasks()
              this.loadStatistics()
            } else {
              this.$message.error(response.message || '创建训练任务失败')
            }
          } catch (error) {
            this.$message.error('创建训练任务失败')
            console.error('创建训练任务失败:', error)
          } finally {
            this.creating = false
          }
        }
      })
    },
    
    // 重置创建表单
    resetCreateForm() {
      this.$refs.createForm && this.$refs.createForm.resetFields()
      this.createForm = {
        name: '',
        modelType: '',
        datasetId: null,
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        description: ''
      }
    },
    
    // 查看任务详情
    async viewTaskDetail(task) {
      this.currentTask = task
      this.showDetailDialog = true
      this.activeTab = 'basic'
      
      // 加载任务详情
      try {
        const response = await trainingApi.getTrainingTaskDetail(task.id)
        if (response.code === 200) {
          this.currentTask = { ...this.currentTask, ...response.data }
        }
      } catch (error) {
        console.error('加载任务详情失败:', error)
      }
      
      // 如果任务正在训练，加载进度
      if (task.status === 'training') {
        this.loadTrainingProgress(task.id)
      }
    },
    
    // 加载训练进度
    async loadTrainingProgress(taskId) {
      try {
        const response = await trainingApi.getTrainingProgress(taskId)
        if (response.code === 200) {
          this.trainingProgress = response.data
        }
      } catch (error) {
        console.error('加载训练进度失败:', error)
      }
    },
    
    // 加载训练日志
    async loadTrainingLogs() {
      if (!this.currentTask) return
      
      try {
        const response = await trainingApi.getTrainingLogs(this.currentTask.id, 1, 50)
        if (response.code === 200) {
          this.trainingLogs = response.data.logs || []
        }
      } catch (error) {
        console.error('加载训练日志失败:', error)
      }
    },
    
    // 开始训练
    async startTraining(taskId) {
      try {
        const response = await trainingApi.startTraining(taskId)
        if (response.code === 200) {
          this.$message.success('训练任务已开始')
          this.loadTrainingTasks()
          this.loadStatistics()
        } else {
          this.$message.error(response.message || '启动训练失败')
        }
      } catch (error) {
        this.$message.error('启动训练失败')
        console.error('启动训练失败:', error)
      }
    },
    
    // 停止训练
    async stopTraining(taskId) {
      this.$confirm('确定要停止这个训练任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await trainingApi.stopTraining(taskId)
          if (response.code === 200) {
            this.$message.success('训练任务已停止')
            this.loadTrainingTasks()
            this.loadStatistics()
          } else {
            this.$message.error(response.message || '停止训练失败')
          }
        } catch (error) {
          this.$message.error('停止训练失败')
          console.error('停止训练失败:', error)
        }
      })
    },
    
    // 评估模型
    async evaluateModel() {
      if (!this.currentTask) return
      
      try {
        const response = await trainingApi.evaluateModel(this.currentTask.id, {})
        if (response.code === 200) {
          this.evaluation = response.data
          this.$message.success('模型评估完成')
        } else {
          this.$message.error(response.message || '模型评估失败')
        }
      } catch (error) {
        this.$message.error('模型评估失败')
        console.error('模型评估失败:', error)
      }
    },
    
    // 导出模型
    async exportModel(taskId) {
      try {
        const response = await trainingApi.exportModel(taskId, { format: 'onnx' })
        if (response.code === 200) {
          this.$message.success('模型导出成功')
        } else {
          this.$message.error(response.message || '模型导出失败')
        }
      } catch (error) {
        this.$message.error('模型导出失败')
        console.error('模型导出失败:', error)
      }
    },
    
    // 上传数据集
    uploadDataset() {
      this.$refs.uploadForm.validate(async (valid) => {
        if (valid && this.fileList.length > 0) {
          this.uploading = true
          try {
            const file = this.fileList[0].raw
            const response = await trainingApi.uploadDataset(
              file,
              this.uploadForm.name,
              this.uploadForm.description,
              this.uploadForm.dataType
            )
            if (response.code === 200) {
              this.$message.success('数据集上传成功')
              this.showUploadDialog = false
              this.loadDatasets()
              this.resetUploadForm()
            } else {
              this.$message.error(response.message || '数据集上传失败')
            }
          } catch (error) {
            this.$message.error('数据集上传失败')
            console.error('数据集上传失败:', error)
          } finally {
            this.uploading = false
          }
        } else {
          this.$message.error('请填写完整信息并选择文件')
        }
      })
    },
    
    // 文件选择处理
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    
    // 重置上传表单
    resetUploadForm() {
      this.$refs.uploadForm && this.$refs.uploadForm.resetFields()
      this.uploadForm = {
        name: '',
        dataType: '',
        description: ''
      }
      this.fileList = []
    },
    
    // 获取模型类型名称
    getModelTypeName(typeId) {
      const type = this.modelTypes.find(t => t.id === typeId)
      return type ? type.name : typeId
    },
    
    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        pending: '',
        training: 'warning',
        completed: 'success',
        failed: 'danger',
        stopped: 'info'
      }
      return statusMap[status] || ''
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        pending: '待开始',
        training: '训练中',
        completed: '已完成',
        failed: '失败',
        stopped: '已停止'
      }
      return statusMap[status] || status
    },
    
    // 显示评估对话框
    showEvaluateDialog(task) {
      this.currentTask = task
      this.showEvaluateDialog = true
      this.evaluationResult = null
    },
    
    // 评估模型
    async evaluateModel() {
      if (!this.evaluateForm.testDatasetId) {
        this.$message.error('请选择测试数据集')
        return
      }
      
      this.evaluating = true
      try {
        const response = await trainingApi.evaluateModel(this.currentTask.id, {
          testDatasetId: this.evaluateForm.testDatasetId
        })
        if (response.code === 200) {
          this.evaluationResult = response.data
          this.$message.success('模型评估完成')
        } else {
          this.$message.error(response.message || '模型评估失败')
        }
      } catch (error) {
        this.$message.error('模型评估失败')
        console.error('模型评估失败:', error)
      } finally {
        this.evaluating = false
      }
    },
    
    // 显示部署对话框
    showDeployDialog(task) {
      this.currentTask = task
      this.showDeployDialog = true
      this.deploymentResult = null
    },
    
    // 部署模型
     async deployModel() {
       if (!this.deployForm.deploymentName || !this.deployForm.deploymentType) {
         this.$message.error('请填写完整的部署信息')
         return
       }
       
       this.deploying = true
       try {
         const response = await trainingApi.deployModel(this.currentTask.id, {
           deploymentName: this.deployForm.deploymentName,
           deploymentType: this.deployForm.deploymentType
         })
         if (response.code === 200) {
           this.deploymentResult = response.data
           this.$message.success('模型部署成功')
         } else {
           this.$message.error(response.message || '模型部署失败')
         }
       } catch (error) {
         this.$message.error('模型部署失败')
         console.error('模型部署失败:', error)
       } finally {
         this.deploying = false
       }
     },
     
     // 显示导出对话框
     showExportDialog(task) {
       this.currentTask = task
       this.exportDialogVisible = true
       this.exportResult = null
     },
     
     // 导出模型
     async exportModel() {
       if (!this.exportForm.format) {
         this.$message.error('请选择导出格式')
         return
       }
       
       this.exporting = true
       try {
         const response = await trainingApi.exportModel(this.currentTask.id, {
           format: this.exportForm.format
         })
         if (response.code === 200) {
           this.exportResult = response.data
           this.$message.success('模型导出成功')
         } else {
           this.$message.error(response.message || '模型导出失败')
         }
       } catch (error) {
         this.$message.error('模型导出失败')
         console.error('模型导出失败:', error)
       } finally {
         this.exporting = false
       }
     },
     
     // 下载模型
     downloadModel() {
       if (this.exportResult && this.exportResult.downloadUrl) {
         window.open(this.exportResult.downloadUrl, '_blank')
       } else {
         this.$message.error('下载链接不可用')
       }
     },
     
     // 格式化文件大小
     formatFileSize(bytes) {
       if (bytes === 0) return '0 Bytes'
       const k = 1024
       const sizes = ['Bytes', 'KB', 'MB', 'GB']
       const i = Math.floor(Math.log(bytes) / Math.log(k))
       return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
     }
  }
}
</script>

<style scoped>
.model-training {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

/* 统计卡片样式 */
.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card.running {
  border-left: 4px solid #E6A23C;
}

.stat-card.completed {
  border-left: 4px solid #67C23A;
}

.stat-card.failed {
  border-left: 4px solid #F56C6C;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  color: #E4E7ED;
  z-index: 1;
}

/* 筛选卡片样式 */
.filter-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

/* 表格卡片样式 */
.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
}

/* 任务详情样式 */
.metrics {
  padding: 10px 0;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #EBEEF5;
}

.metric-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.metric-label {
  color: #606266;
  font-weight: 500;
}

.metric-value {
  color: #303133;
  font-weight: bold;
}

/* 训练日志样式 */
.logs-container {
  height: 400px;
}

.log-content {
  height: 350px;
  overflow-y: auto;
  background: #F5F7FA;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.log-item {
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  line-height: 1.4;
}

.log-item.info {
  background: #E1F3D8;
  color: #67C23A;
}

.log-item.warning {
  background: #FDF6EC;
  color: #E6A23C;
}

.log-item.error {
  background: #FEF0F0;
  color: #F56C6C;
}

.log-timestamp {
  color: #909399;
  margin-right: 10px;
}

.log-level {
  font-weight: bold;
  margin-right: 10px;
  min-width: 50px;
  display: inline-block;
}

.log-message {
  flex: 1;
}

/* 评估指标样式 */
.evaluation-metrics {
  padding: 10px 0;
}

.confusion-matrix {
  text-align: center;
}

.confusion-matrix table {
  margin: 0 auto;
  border-collapse: collapse;
}

.confusion-matrix td {
  border: 1px solid #DCDFE6;
  padding: 10px 15px;
  text-align: center;
  font-weight: bold;
}

/* 数据集管理样式 */
.dataset-management {
  min-height: 400px;
}

.dataset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 评估结果样式 */
.evaluation-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.metric-card {
  text-align: center;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-card .metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.metric-card .metric-label {
  font-size: 14px;
  color: #666;
}

/* 部署结果样式 */
.deployment-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.deployment-result h4 {
  margin-top: 0;
  color: #409eff;
}

.deployment-result p {
  margin: 8px 0;
  line-height: 1.5;
}

/* 导出结果样式 */
.export-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #67c23a;
}

.export-result h4 {
  margin-top: 0;
  color: #67c23a;
}

.export-result p {
  margin: 8px 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .model-training {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .stats-cards .el-col {
    margin-bottom: 10px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>