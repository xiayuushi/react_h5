import React from 'react'
import styles from './login.module.css'
import login_title from '../../asstes/images/login_title.png'
import { BASEURL } from '../../utils/base_url'
import axios from 'axios'
import { Toast } from 'antd-mobile'

// st1、安装formik并导入其中的HOC
import { withFormik } from 'formik'
// st7、安装并导入Yup对formik表单进行规则验证
import * as Yup from 'yup'

// 实例化一个axios用于在formik中发送请求
const instance = axios.create({
  baseURL: BASEURL
})

// st5、改写类组件为函数组件
const Login = props => {
  // st6、解构接收映射的数据并用于页面渲染
  let {
    values,
    handleChange,
    handleSubmit,
    errors,
    handleBlur,
    touched
  } = props
  // st9、通过props.error可以获取Yup的校验结果
  // 当验证规则不符合时,props.error对象才会有值
  // console.log(errors)

  // st10、给input表单绑定onBlur事件关联handleBlur方法，之后就可以使用touched得到是否操作过对应的表单
  // 注意:这个touched就如字面意思,它仅仅是感知是否对表单操作过,它无法知道Yup验证的结果是否正确
  // 也就是说,操作了表单 touched的值就是true 否则就是false
  console.log(touched)

  return (
    <div className={styles.login_wrap}>
      <span
        className={[styles.back, 'iconfont', 'icon-prev'].join(' ')}
        onClick={() => this.props.history.goBack()}
      ></span>
      <div className={styles.login_title}>
        <img src={login_title} alt='login' />
      </div>
      <form className={styles.login_form}>
        <div className={styles.form_group}>
          <input
            type='text'
            placeholder='用户名'
            value={values.username}
            onChange={handleChange}
            id='username'
            autoComplete='off'
            onBlur={handleBlur}
          />
          {/* Yup验证后的提示信息 */}
          {/* 如果操作过该表单元素,且值不符合验证结果(即,errors对象有值)就显示该提示 */}
          {touched.username && errors.username && (
            <p className={styles['err_tip']}>{errors.username}</p>
          )}

          <input
            type='password'
            placeholder='密码'
            // value={values.password}

            onChange={handleChange}
            name='password'
            onBlur={handleBlur}
          />
          {touched.password && errors.password && (
            <p className={[styles.err_tip, styles.err_pass_tip].join(' ')}>
              {errors.password}
            </p>
          )}
        </div>
        <input
          type='button'
          value='登 录'
          className={styles['input_sub']}
          onClick={handleSubmit}
        />
      </form>
      <div className={styles['register']}>新用户注册</div>
      <div className={styles['findpass']}>忘记密码</div>
    </div>
  )
}

// st2、使用HOC生成新的组件
const WithLogin = withFormik({
  // st4、映射state中的数据到props属性上
  mapPropsToValues: () => ({ username: '', password: '' }),
  // st8、配合正则表达式验证state中input表单的字段
  validationSchema: Yup.object({
    username: Yup.string()
      .max(15, '用户最大字符不得超过15')
      .required('用户名不能为空'),
    password: Yup.string()
      .matches(/^\w{5,15}$/, '密码长度在5-15位')
      .required('密码不能为空')
  }),
  // st6、提交时触发的函数
  handleSubmit: async (values, { props }) => {
    // 发送请求：因为当前并非在组件结构内部，之前封装的axios请求无法通过this.$request()获取
    // 因为此处的this并非指向组件实例，所以必须重新导入axios发送请求
    let res = await instance({
      url: '/user/login',
      method: 'post',
      data: values
    })
    // console.log(res)
    let { status, description, body } = res.data
    if (status === 200) {
      Toast.success(description, 1, () => {
        // 存储token到本地
        localStorage.setItem('haoke_token', JSON.stringify(body))
        // 返回之前的页面
        props.history.goBack()
      })
    } else {
      Toast.fail(description)
      return
    }
  }
})(Login)

// st3、导出HOC生成的组件
export default WithLogin
