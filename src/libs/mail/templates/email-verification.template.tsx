import { Body, Button, Container, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components"
import * as React from 'react'

interface ConfirmationTemplateProps {
	domain: string
	token: string
}

export function VerificationTemplate({
	domain,
	token
}: ConfirmationTemplateProps) {
	const confirmLink = `${domain}/auth/verify?token=${token}`

	return (
		<Tailwind>
			<Html>
				<Preview>Подтвердите ваш адрес электронной почты</Preview>
				<Body className="text-white font-sans">
					<Container className="max-w-[400px]">
						<Section className="bg-zinc-900 border border-white/30 rounded-lg p-6 mb-6">
						<Section className="text-center mb-8">
							<Heading className="text-2xl font-bold mb-2">
								Подтверждение почты
							</Heading>
							<Text className="text-zinc-400">
								Пожалуйста, подтвердите ваш адрес электронной почты
							</Text>
						</Section>

							<div className="text-center mb-6">
								<Button
									href={confirmLink}
									className="bg-white text-black text-base font-medium py-3 px-6 rounded-lg inline-block"
								>
									Подтвердить почту
								</Button>
							</div>
							
							<Section className="bg-zinc-800 border-l-4 border-zinc-500 p-4 rounded">
								<Text className="text-zinc-400 text-sm leading-relaxed">
									<strong className="text-white">Важно:</strong> Эта ссылка действительна в течение 1 часа. 
									Если вы не запрашивали подтверждение, просто проигнорируйте это сообщение.
								</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	)
}