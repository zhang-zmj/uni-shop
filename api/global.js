let baseUrl = ''
if (process.env.NODE_ENV === 'development') {
	console.log('开发环境')
	baseUrl = 'http://localhost:3000'
} else {
	console.log('生产环境')
	baseUrl = ''
}
export default {
	baseUrl
}


