import { Body, Heading, Link, Tailwind, Text } from "@react-email/components"
import { Html } from "@react-email/html"
import * as React from 'react'

interface PasswordResetTemplateProps {
	domain: string
	token: string
}

export function PasswordResetTemplate({
	domain,
	token
}: PasswordResetTemplateProps) {
	const confirmLink = `${domain}/auth/reset-password?token=${token}`

	return (
		<Tailwind> 
			<Html>
				<Body className='text-black'>
					<Heading>Сброс пароля</Heading>
					<Text>
						Чтобы подтвердить свой пароль, пожалуйста, перейдите по следующей ссылке:
					</Text>
					<Link href={confirmLink}>Сбросить пароль</Link>
					<Text>
						Эта ссылка действительна в течение 1 часа. Если вы не запрашивали сброс, просто проигнорируйте это сообщение.
					</Text>
				</Body>
			</Html>
		</Tailwind>
	)
}