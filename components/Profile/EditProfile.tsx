import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { Button, DatePicker, Form, Input, Modal, Upload } from 'antd';
import { UserOutlined, UploadOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useAuth } from '../../utils/UserAuth';
import AuthAxios from '../../apiAxios/authAxios';
import {
  errorNotification,
  successNotification,
  warningNotification,
} from '../../utils/notification';
import PasswordVerification from '../shared/PasswordVerification';
import { closeModal, openModal } from '../../store/modalSlice';
import { MODAL_KEYS } from '../../constants/reduxKeys';
import { AUTH } from '../../constants/queryKeys';
import type { RootState } from '../../store';
import type IMessage from '../../interface/message';

const { EDIT_PROFILE, PASSWORD_VERIFICATION } = MODAL_KEYS;

const EditProfile = () => {
  const { isOpen } = useSelector((state: RootState) => state.modal);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const { authUser } = useAuth();

  const [form] = Form.useForm();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const fileUploadOptions = {
    maxCount: 1,
    multiple: false,
    showUploadList: true,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        warningNotification(`${file.name} is not an image file`);
        return isImage || Upload.LIST_IGNORE;
      }
      if (file) setSelectedImage(file);

      return false;
    },
    onRemove: () => setSelectedImage(null),
  };

  const handleEditProfile = useMutation(
    (formValues: any) => {
      // * avoid append if formvalue is empty
      const formData = new FormData();

      Object.keys(formValues).forEach((key) => {
        if (formValues[key]) formData.append(key, formValues[key]);
      });

      if (selectedImage) formData.append('image', selectedImage);

      return new AuthAxios().updateUser(formData);
    },
    {
      onSuccess: (res: IMessage) => {
        successNotification(res.message);
        queryClient.refetchQueries([AUTH]);
        dispatch(closeModal({ key: EDIT_PROFILE }));
        dispatch(closeModal({ key: PASSWORD_VERIFICATION }));
      },
      onError: (err: Error) => errorNotification(err),
    }
  );

  return (
    <Modal
      centered
      className='font-sans'
      open={isOpen[EDIT_PROFILE]}
      onCancel={() => dispatch(closeModal({ key: EDIT_PROFILE }))}
      footer={null}
    >
      <Form
        autoComplete='off'
        form={form}
        initialValues={{ remember: true }}
        layout='vertical'
        name='form_in_modal'
        requiredMark={false}
        onFinish={async () =>
          form.validateFields().then(() => dispatch(openModal({ key: PASSWORD_VERIFICATION })))
        }
      >
        <Form.Item
          label='Full Name'
          name='fullname'
          initialValue={authUser.fullname}
          rules={[{ required: true, message: 'Please input your fullname!' }]}
        >
          <Input
            className='rounded-lg p-2'
            placeholder='Full Name'
            prefix={<UserOutlined className='text-gray-600 text-lg mr-2' />}
          />
        </Form.Item>
        <Form.Item
          label='Email'
          name='email'
          initialValue={authUser.email}
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input
            className='rounded-lg p-2'
            placeholder='Email'
            prefix={<UserOutlined className='text-gray-600 text-lg mr-2' />}
            type='email'
            disabled
          />
        </Form.Item>

        <Form.Item label='Bio' name='bio' initialValue={authUser.bio}>
          <Input
            className='rounded-lg p-2'
            placeholder='Bio'
            prefix={<InfoCircleOutlined className='text-gray-600 text-lg mr-2' />}
          />
        </Form.Item>

        <Form.Item label='Website' name='website' initialValue={authUser.website}>
          <Input
            className='rounded-lg p-2'
            placeholder='Website'
            prefix={<LinkOutlined className='text-gray-600 text-lg mr-2' />}
          />
        </Form.Item>

        <div className='w-full grid grid-cols-5'>
          <Form.Item className='sm:col-span-2 col-span-full' label='Display Picture'>
            <Upload {...fileUploadOptions}>
              <Button
                className='rounded-lg flex items-center h-12'
                icon={<UploadOutlined className='text-lg' />}
              >
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            className='sm:col-span-3 col-span-full'
            label='Date of Birth'
            name='dateOfBirth'
            initialValue={moment(authUser.dateOfBirth, 'YYYY-MM-DD')}
            rules={[
              {
                required: true,
                message: 'Please input your Date of birth!',
              },
            ]}
          >
            <DatePicker className='rounded-lg p-3 w-full' />
          </Form.Item>
        </div>

        <Form.Item className='mb-0'>
          <Button type='primary' className='h-10 bg-[#057AFF] rounded-lg' htmlType='submit'>
            Update
          </Button>
        </Form.Item>

        <PasswordVerification
          isLoading={handleEditProfile.isLoading}
          mutation={({ password }) =>
            handleEditProfile.mutate({
              ...form.getFieldsValue(true),
              dateOfBirth: form.getFieldValue('dateOfBirth')._d.toString(),
              password,
            })
          }
        />
      </Form>
    </Modal>
  );
};

export default EditProfile;