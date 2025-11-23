import React from "react";
import { Card, Button, Alert, Space, Typography, Row, Col } from "antd";
import {
  EnvironmentOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import useLocation from "../../hooks/useLocation";

const { Title, Paragraph, Text } = Typography;

interface LocationPermissionProps {
  // eslint-disable-next-line no-unused-vars
  onLocationReady?: (location: any) => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  onLocationReady,
}) => {
  const {
    locationInfo,
    loading,
    error,
    requestLocation,
    clearLocation,
    isLocationAvailable,
  } = useLocation();

  React.useEffect(() => {
    if (isLocationAvailable && onLocationReady) {
      onLocationReady(locationInfo?.location);
    }
  }, [isLocationAvailable, locationInfo, onLocationReady]);

  const getLocationAccuracyText = (source: string) => {
    switch (source) {
      case "GPS":
        return "精确定位 (~10米)";
      case "Network":
        return "网络定位 (~100米)";
      case "IPAddress":
        return "IP定位 (~10公里)";
      default:
        return "位置精度未知";
    }
  };

  return (
    <div className="space-y-4">
      {/* 位置状态显示 */}
      {isLocationAvailable && locationInfo ? (
        <Alert
          message="位置服务已启用"
          description={
            <Space direction="vertical" className="w-full">
              <Text>
                当前位置：{locationInfo.address.city || ""}{" "}
                {locationInfo.address.district || ""}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                定位方式：
                {getLocationAccuracyText(locationInfo.location.source)} |
                更新时间：
                {new Date(locationInfo.location.timestamp).toLocaleString()}
              </Text>
            </Space>
          }
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          action={
            <Space>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={requestLocation}
                loading={loading}
              >
                重新定位
              </Button>
              <Button size="small" type="text" onClick={clearLocation}>
                清除位置
              </Button>
            </Space>
          }
        />
      ) : (
        <Card className="text-center">
          <Space direction="vertical" size="large" className="w-full">
            <EnvironmentOutlined style={{ fontSize: 48, color: "#1890ff" }} />

            <div>
              <Title level={4}>启用位置服务</Title>
              <Paragraph type="secondary">
                为了为您推荐附近的餐厅和食材商店，我们需要获取您的位置信息
              </Paragraph>
            </div>

            {error && (
              <Alert
                message="定位失败"
                description={error}
                type="error"
                showIcon
                icon={<ExclamationCircleOutlined />}
                closable
              />
            )}

            <Button
              type="primary"
              size="large"
              icon={<EnvironmentOutlined />}
              onClick={requestLocation}
              loading={loading}
            >
              {loading ? "正在定位..." : "获取我的位置"}
            </Button>

            {/* 隐私说明 */}
            <Alert
              message="隐私保护"
              description={
                <Space direction="vertical" size={4}>
                  <Text>• 位置信息仅用于餐厅和商店推荐</Text>
                  <Text>• 所有数据存储在本地，不会上传到服务器</Text>
                  <Text>• 您可以随时清除位置信息</Text>
                </Space>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </Space>
        </Card>
      )}

      {/* 定位精度说明 */}
      <Card size="small" title="定位精度说明">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <Text strong>GPS定位</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                精确度：约10米
                <br />
                需要设备支持
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
              <Text strong>网络定位</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                精确度：约100米
                <br />
                基于WiFi/基站
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
              <Text strong>IP定位</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                精确度：约10公里
                <br />
                备选定位方式
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LocationPermission;
